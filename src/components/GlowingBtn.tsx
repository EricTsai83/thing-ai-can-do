import { PiShuffleFill } from 'react-icons/pi';

interface Props {
  executeMethod: () => void;
  text: string;
}

function GlowingBtn({ executeMethod, text }: Props) {
  return (
    <div onClick={executeMethod}>
      <div className="group relative">
        <div className="animate-tilt absolute -inset-0.5 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 opacity-75 blur transition duration-1000 group-hover:opacity-100 group-hover:duration-200"></div>
        <button className="relative flex items-center divide-x divide-gray-600 rounded-lg bg-gray-800 px-7 py-4 leading-none">
          <PiShuffleFill className="text-xl text-white" />
          <span className="flex items-center space-x-5 pl-3"></span>
          <span className="pl-3 font-medium text-gray-100 transition duration-200">
            {text}
          </span>
        </button>
      </div>
    </div>
  );
}

export default GlowingBtn;
