'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import generateHighlyDistinctRGB from '@/utils/generate-highly-distinct-rgb';
import type { UniqueColorsInPng } from '@/utils/get-unique-colors-in-png';
import replaceColorsInPNG from '@/utils/replace-color-in-png';

interface Segmentation {
  score: number;
  label: string;
  mask: string;
}

interface Props {
  segmentations: Segmentation[];
  maskUniqueColors: UniqueColorsInPng;
}

export interface ColorMappingItem {
  targetColor: { r: number; g: number; b: number; a: number };
  replacementColor: {
    r: number;
    g: number;
    b: number;
    a: number;
  };
}

function ColorMask({ segmentations, maskUniqueColors }: Props) {
  const [pngStrAfterColorChange, setPngStrAfterColorChange] = useState<
    string[]
  >([]);

  useEffect(() => {
    if (maskUniqueColors) {
      const randomRGB = generateHighlyDistinctRGB(segmentations.length);
      let arrays: string[] = [];
      segmentations.forEach((segmentation: Segmentation, idx: number) => {
        const colorMappings: ColorMappingItem[] = [
          {
            targetColor: maskUniqueColors['255_255_255_255'],
            replacementColor: {
              r: Math.floor(randomRGB[idx][0]),
              g: Math.floor(randomRGB[idx][1]),
              b: Math.floor(randomRGB[idx][2]),
              a: 300,
            },
          },
          {
            targetColor: maskUniqueColors['0_0_0_255'],
            replacementColor: { r: 0, g: 0, b: 0, a: 0 },
          },
        ];

        replaceColorsInPNG(segmentation.mask, colorMappings).then(
          (modifiedPNGString): void => {
            const pngStr = modifiedPNGString as string;
            modifiedPNGString && arrays.push(pngStr);
          },
        );
      });
      setPngStrAfterColorChange(arrays);
    }
  }, [segmentations, maskUniqueColors]);

  return (
    <div className="relative z-10">
      {pngStrAfterColorChange &&
        pngStrAfterColorChange.map((pngStr: string, id: number) => {
          return (
            <Image
              className="absolute max-h-[360px] w-auto"
              key={id}
              src={pngStr}
              alt="Decoded Image"
              style={{ opacity: '0.5' }}
              width={0}
              height={0}
            />
          );
        })}
    </div>
  );
}

export default ColorMask;
