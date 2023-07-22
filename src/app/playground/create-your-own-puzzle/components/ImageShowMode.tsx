import { RadioGroup } from '@headlessui/react';
import { plans } from './plans';
import { Selected } from '../types.d';
import type { Dispatch, SetStateAction } from 'react';
import CheckIcon from '@/components/CheckIcon';

interface Props {
  selected: Selected;
  setSelected: Dispatch<SetStateAction<Selected>>;
  setShowImage: Dispatch<SetStateAction<boolean>>;
  getPuzzle: () => void;
  setShowDifficultPuzzle: Dispatch<SetStateAction<boolean>>;
  SetShowEasyPuzzle: Dispatch<SetStateAction<boolean>>;
}

export default function ImageShowMode({
  selected,
  setSelected,
  setShowImage,
  getPuzzle,
  setShowDifficultPuzzle,
  SetShowEasyPuzzle,
}: Props) {
  return (
    <div className="w-full px-4">
      <div className="mx-auto w-full">
        <RadioGroup value={selected} onChange={setSelected}>
          <RadioGroup.Label className="sr-only">Server size</RadioGroup.Label>
          <div className="flex flex-col justify-center gap-3 space-y-2 md:flex-row md:gap-10">
            {plans.map((plan) => (
              <RadioGroup.Option
                onClick={() => {
                  if (
                    plan.name === '拼圖遊戲(困難)' &&
                    selected.name !== '拼圖遊戲(困難)'
                  ) {
                    SetShowEasyPuzzle(false);
                    setShowImage(false);
                    getPuzzle();
                  } else if (
                    plan.name === '拼圖遊戲(簡單)' &&
                    selected.name !== '拼圖遊戲(簡單)'
                  ) {
                    setShowDifficultPuzzle(false);
                    setShowImage(false);
                    SetShowEasyPuzzle(true);
                  } else if (
                    plan.name === '直接顯示圖片' &&
                    selected.name !== '直接顯示圖片'
                  ) {
                    setShowDifficultPuzzle(false);
                    SetShowEasyPuzzle(false);
                    setShowImage(true);
                  }
                }}
                key={plan.name}
                value={plan}
                className={({ active, checked }) =>
                  `${
                    active
                      ? 'ring-2 ring-white ring-opacity-60 ring-offset-2 ring-offset-sky-300'
                      : ''
                  }
                  ${
                    checked
                      ? 'bg-cyan-800 bg-opacity-75 text-white'
                      : 'bg-white'
                  }
                    relative flex cursor-pointer rounded-lg px-5 py-4 shadow-md focus:outline-none`
                }>
                {({ active, checked }) => (
                  <>
                    <div className="flex w-full items-center justify-between">
                      <div className="flex items-center">
                        <div className="text-base">
                          <RadioGroup.Label
                            as="p"
                            className={`font-medium  ${
                              checked ? 'text-white' : 'text-gray-900'
                            }`}>
                            {plan.name}
                          </RadioGroup.Label>
                          <RadioGroup.Description
                            as="span"
                            className={`inline ${
                              checked ? 'text-sky-100' : 'text-gray-500'
                            }`}>
                            <span>
                              {plan.ram}/{plan.cpus}
                            </span>{' '}
                            <span aria-hidden="true">&middot;</span>{' '}
                            <span>{plan.disk}</span>
                          </RadioGroup.Description>
                        </div>
                      </div>
                      {checked && (
                        <div className="shrink-0 text-white">
                          <CheckIcon className="h-6 w-6" />
                        </div>
                      )}
                    </div>
                  </>
                )}
              </RadioGroup.Option>
            ))}
          </div>
        </RadioGroup>
      </div>
    </div>
  );
}
