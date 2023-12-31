import Konva from 'konva';
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { IoIosRefreshCircle } from 'react-icons/io';
import { Layer, Line, Stage, Text } from 'react-konva';
import LoadingButton from '@/components/LoadingButton';
import { apiNotify } from '@/components/ReactToast';
import { FlipToastContainer } from '@/components/ReactToast';
import TooltipContainer from '@/components/TooltipContainer';
import dataURItoBlob from '@/utils/dataURItoBlob';
import huggingFaceApi from '@/utils/hugging-face-api';
import type { Response } from '../types';

interface LineData {
  drawingTool: string;
  points: number[];
}

interface CanvasProps {
  drawingTool: string;
  setResponses: Dispatch<SetStateAction<Response[] | null>>;
}

interface CanvasStageWidth {
  width: number;
}

function Canvas({ drawingTool, setResponses }: CanvasProps) {
  const [lines, setLines] = useState<LineData[]>([]);
  const isDrawing = useRef(false);
  const stageRef = useRef<Konva.Stage>(null);
  const divRef = useRef<HTMLDivElement>(null);
  const [canvasStageWidth, setCanvasStageWidth] = useState<CanvasStageWidth>({
    width: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleMouseDown = (event: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = event.target.getStage();
    if (!stage) return;

    isDrawing.current = true;
    const pos = stage.getPointerPosition();
    setLines([...lines, { drawingTool, points: [pos?.x ?? 0, pos?.y ?? 0] }]);
  };

  const handleMouseMove = (event: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isDrawing.current) {
      return;
    }
    const stage = event.target.getStage();
    if (!stage) return;

    const point = stage.getPointerPosition();
    const lastLine = { ...lines[lines.length - 1] };
    lastLine.points = lastLine.points.concat([point?.x ?? 0, point?.y ?? 0]);
    lines.splice(lines.length - 1, 1, lastLine);
    setLines([...lines]);
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  const handleExport = () => {
    const stage = stageRef.current;
    if (!stage) return;
    const uri = stage.toDataURL();
    downloadURI(uri, 'stage.png');
  };

  async function getSketchClassifier() {
    const stage = stageRef.current;
    if (!stage) return;
    try {
      setIsLoading(true);
      const uri = stage.toDataURL();
      const blobData = dataURItoBlob(uri);
      const response = await huggingFaceApi.getSketchClassifier(blobData);

      if (response.error) {
        apiNotify();
      } else {
        setResponses(response);
      }
    } catch (e) {
      apiNotify();
    } finally {
      setIsLoading(false);
    }
  }

  function downloadURI(uri: string, name: string) {
    var link = document.createElement('a');
    link.download = name;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  useEffect(() => {
    if (divRef.current?.offsetWidth) {
      setCanvasStageWidth({
        width: divRef.current.offsetWidth,
      });
    }
  }, []);

  const handleClearCanvas = () => {
    setLines([]);
  };

  return (
    <div ref={divRef} className="relative w-full">
      <button
        onClick={handleClearCanvas}
        className="absolute right-4 top-4 z-10">
        <IoIosRefreshCircle className="text-3xl text-teal-500" />
      </button>
      <Stage
        ref={stageRef}
        width={canvasStageWidth.width}
        height={350}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className="border">
        <Layer>
          <Text text="在這畫上你的創意 ❤️" x={10} y={30} />
          {lines.map((line, i) => (
            <Line
              key={i}
              points={line.points}
              stroke="#df4b26"
              strokeWidth={5}
              tension={0.5}
              lineCap="round"
              lineJoin="round"
              globalCompositeOperation={
                line.drawingTool === 'eraser'
                  ? 'destination-out'
                  : 'source-over'
              }
            />
          ))}
        </Layer>
      </Stage>
      <div className="mt-5 flex justify-between">
        <button
          onClick={handleExport}
          className="
          flex h-12 w-40 items-center justify-center rounded
        bg-cyan-600 text-lg text-white hover:bg-cyan-500
        active:bg-cyan-400 
">
          下載圖畫
        </button>
        <TooltipContainer
          tooltips="
            在一段時間後，首次做模型推論，
            模型得先進行加載，若推論失敗，請等待幾秒鐘後，再次點擊按鈕。">
          <LoadingButton
            isLoading={isLoading}
            executeFunction={getSketchClassifier}
            text="模型推論"
          />
        </TooltipContainer>
      </div>

      <FlipToastContainer />
    </div>
  );
}

export default Canvas;
