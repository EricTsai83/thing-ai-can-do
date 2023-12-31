'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  Category,
  DrawingUtils,
  FaceLandmarker,
  FaceLandmarkerOptions,
  FilesetResolver,
} from '@mediapipe/tasks-vision';
import { Canvas } from '@react-three/fiber';
import { KeyboardEventHandler, useEffect, useRef, useState } from 'react';
import RingLoader from 'react-spinners/RingLoader';
import { Color, Euler, Matrix4 } from 'three';
import ToolTip from '@/components/ToolTip';
import type { SearchParams } from '../types';
import Avatar from './components/Avatar';
import readyPlayerMeImg from './img/ready-player-me-banner.png';

let video: HTMLVideoElement;
let faceLandmarker: FaceLandmarker;
let lastVideoTime = -1;

const options: FaceLandmarkerOptions = {
  baseOptions: {
    modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
    delegate: 'GPU',
  },
  numFaces: 1,
  runningMode: 'VIDEO',
  outputFaceBlendshapes: true,
  outputFacialTransformationMatrixes: true,
};

function AvatarBox({ searchParams }: { searchParams: SearchParams }) {
  const [blendshapes, setBlendshapes] = useState<Category[]>([]);
  const [rotation, setRotation] = useState<Euler>();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [url, setUrl] = useState<string | null>(null);

  function validateURL(url: string): boolean {
    const pattern = /^https:\/\/models\.readyplayer\.me\/.*\.glb$/;
    return pattern.test(url);
  }

  async function setup() {
    const filesetResolver = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm',
    );

    faceLandmarker = await FaceLandmarker.createFromOptions(
      filesetResolver,
      options,
    );

    video = document.getElementById('video') as HTMLVideoElement;
    navigator.mediaDevices
      .getUserMedia({
        video: { width: 360, height: 360 },
        audio: false,
      })
      .then(function (stream) {
        video.srcObject = stream;
        video.addEventListener('loadeddata', predict);
      });
  }

  async function drawMaskOnWebcam() {
    const videoWidth = 200;
    const canvasElement = document.getElementById(
      'output_canvas',
    ) as HTMLCanvasElement;
    if (canvasElement.getContext('2d')) {
      const canvasCtx = canvasElement.getContext('2d')!;

      const radio = video.videoHeight / video.videoWidth;
      video.style.width = videoWidth + 'px';
      video.style.height = videoWidth * radio + 'px';
      canvasElement.style.width = videoWidth + 'px';
      canvasElement.style.height = videoWidth * radio + 'px';
      canvasElement.width = video.videoWidth;
      canvasElement.height = video.videoHeight;

      let nowInMs = Date.now();
      let results = undefined;
      let lastVideoTime = -1;
      const drawingUtils = new DrawingUtils(canvasCtx);
      if (lastVideoTime !== video.currentTime) {
        lastVideoTime = video.currentTime;
        results = faceLandmarker.detectForVideo(video, nowInMs);
      }
      if (results?.faceLandmarks) {
        for (const landmarks of results.faceLandmarks) {
          drawingUtils.drawConnectors(
            landmarks,
            FaceLandmarker.FACE_LANDMARKS_TESSELATION,
            { color: '#73be73', lineWidth: 1 },
          );
          drawingUtils.drawConnectors(
            landmarks,
            FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE,
            { color: '#4d944d' },
          );
          drawingUtils.drawConnectors(
            landmarks,
            FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW,
            { color: '#D3D3D3' },
          );
          drawingUtils.drawConnectors(
            landmarks,
            FaceLandmarker.FACE_LANDMARKS_LEFT_EYE,
            { color: '#4d944d' },
          );
          drawingUtils.drawConnectors(
            landmarks,
            FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW,
            { color: '#D3D3D3' },
          );
          drawingUtils.drawConnectors(
            landmarks,
            FaceLandmarker.FACE_LANDMARKS_FACE_OVAL,
            { color: '#73be73' },
          );
          drawingUtils.drawConnectors(
            landmarks,
            FaceLandmarker.FACE_LANDMARKS_LIPS,
            { color: '#ffcccb' },
          );
          drawingUtils.drawConnectors(
            landmarks,
            FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS,
            { color: '#90ee90' },
          );
          drawingUtils.drawConnectors(
            landmarks,
            FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS,
            { color: '#90ee90' },
          );
        }
      }
    }
  }

  let animationFrame: number;
  async function predict() {
    await drawMaskOnWebcam();

    let nowInMs = Date.now();
    if (lastVideoTime !== video.currentTime) {
      lastVideoTime = video.currentTime;
      const faceLandmarkerResult = faceLandmarker.detectForVideo(
        video,
        nowInMs,
      );

      if (
        faceLandmarkerResult.faceBlendshapes &&
        faceLandmarkerResult.faceBlendshapes.length > 0 &&
        faceLandmarkerResult.faceBlendshapes[0].categories
      ) {
        const blendshapesData =
          faceLandmarkerResult.faceBlendshapes[0].categories;
        setBlendshapes(blendshapesData);
        const matrix = new Matrix4().fromArray(
          faceLandmarkerResult.facialTransformationMatrixes![0].data,
        );
        const rotationData = new Euler().setFromRotationMatrix(matrix);
        setRotation(rotationData);
      }
    }
    animationFrame = window.requestAnimationFrame(predict);
  }

  const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (event.key !== 'Enter') return;
    const target = event.target as HTMLInputElement;
    if (validateURL(target.value) && event.key === 'Enter') {
      setUrl(target.value);
      target.value = '';
    } else {
      window.alert('URL is not right');
    }
  };

  useEffect(() => {
    setup();
    return () => {
      video && video.removeEventListener('loadeddata', predict);
      animationFrame && window.cancelAnimationFrame(animationFrame);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if ('gender' in searchParams && 'age' in searchParams) {
      if (searchParams.gender === 'man' && searchParams.age === '40') {
        setUrl('https://models.readyplayer.me/649068aea1051fa7234fdbdf.glb');
      } else if (searchParams.gender === 'woman' && searchParams.age === '36') {
        setUrl('https://models.readyplayer.me/649fb6cd0b339f947f7c5e2b.glb');
      } else if (searchParams.gender === 'man' && searchParams.age === '28') {
        setUrl('https://models.readyplayer.me/648ef0aef2caada0866fd637.glb');
      } else if (searchParams.gender === 'woman' && searchParams.age === '18') {
        setUrl('https://models.readyplayer.me/6490674099211a8c97fc3ee9.glb');
      } else {
        //pass
      }
    }
  }, [searchParams.gender, searchParams.age, searchParams, setUrl]);

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border-cyan-600">
      <div className="h-7 w-[320px] rounded-t-2xl bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 ssm:w-[380px] md:w-[450px]"></div>
      <div className="flex items-center justify-center rounded-t-xl">
        <div
          className="
            relative flex h-[600px] w-[320px] flex-col items-center
            justify-center bg-gradient-to-r  from-cyan-500
          to-blue-500 ssm:w-[380px] md:w-[450px]">
          <input
            ref={inputRef}
            className="mt-4 flex h-8 w-4/5 items-center justify-center rounded-xl bg-stone-100 px-[16px]"
            type="text"
            placeholder="Paste RPM avatar URL"
            onKeyDown={handleKeyDown}
          />
          <div className="relative mt-4 h-[80px] w-full">
            <video
              id="video"
              className="absolute right-3 top-0 h-full rounded-3xl"
              autoPlay
              playsInline></video>
            <canvas
              className="absolute right-3 top-0"
              id="output_canvas"></canvas>
          </div>

          {rotation && url ? (
            <Canvas style={{ height: 500 }} camera={{ fov: 25 }} shadows>
              <ambientLight intensity={0.5} />
              <pointLight
                position={[10, 10, 10]}
                color={new Color(1, 1, 0)}
                intensity={0.5}
                castShadow
              />
              <pointLight
                position={[-10, 0, 10]}
                color={new Color(1, 0, 0)}
                intensity={0.5}
                castShadow
              />
              <pointLight position={[0, 0, 10]} intensity={0.5} castShadow />
              {rotation && url && (
                <Avatar
                  url={url}
                  blendshapes={blendshapes}
                  rotation={rotation}
                />
              )}
            </Canvas>
          ) : (
            <div className="flex h-[500px] items-center justify-center">
              <ToolTip tooltip="請選擇虛擬人像">
                <RingLoader
                  color="#36d7b7"
                  cssOverride={{}}
                  loading={true}
                  size={60}
                  speedMultiplier={1}
                  aria-label="Loading Spinner"
                  data-testid="loader"
                />
              </ToolTip>
            </div>
          )}

          <div
            className="
              flex w-[320px] rounded-b-2xl bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 p-1
              ssm:w-[380px] md:w-[450px]">
            <Link
              className="flex items-center"
              href="https://demo.readyplayer.me/avatar"
              target="_blank"
              rel="noreferrer noopenner">
              <ToolTip tooltip="點我創建屬於自己的虛擬人像">
                <div className="rounded-b-2xl ">
                  <Image
                    className="rounded-2xl"
                    src={readyPlayerMeImg}
                    alt="ready player me logo"
                    width={0}
                    height={0}
                    style={{
                      width: '100%',
                      height: 'auto',
                    }}
                  />
                </div>
              </ToolTip>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AvatarBox;
