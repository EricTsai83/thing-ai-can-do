import { useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode, MouseEventHandler } from 'react';
import ContentContext from '../context/ContentContext';
import SplitPaneContext from '../context/SplitPaneContext';
import Delimiter from './prompt/Delimiter';
import StructureFormat from './prompt/StructureFormat';
import Condition from './prompt/Condition';
import Link from 'next/link';
import Imitate from './prompt/Imitate';

interface SplitPaneProps {
  children: ReactNode[];
  className: string;
}

// ...props: 可以方便你重用組建時，取不一樣的props
function SplitPane({ children, ...props }: SplitPaneProps) {
  const [clientHeight, setClientHeight] = useState<number | null>(null);
  const [clientWidth, setClientWidth] = useState<number | null>(null);
  const yDividerPos = useRef<number | null>(null);
  const xDividerPos = useRef<number | null>(null);

  // 按下左鍵
  const onMouseHoldDown: MouseEventHandler = (event) => {
    yDividerPos.current = event.clientY;
    xDividerPos.current = event.clientX;
  };

  // 放開左鍵
  const onMouseHoldUp = () => {
    yDividerPos.current = null;
    xDividerPos.current = null;
  };

  // 按者左鍵移動滑鼠
  const onMouseHoldMove: EventListener = (event) => {
    if (yDividerPos.current === null || xDividerPos.current === null) {
      return;
    }
    const mouseEvent = event as MouseEvent;
    clientHeight &&
      setClientHeight(clientHeight + mouseEvent.clientY - yDividerPos.current);
    clientWidth &&
      setClientWidth(clientWidth + mouseEvent.clientX - xDividerPos.current);
    yDividerPos.current = mouseEvent.clientY;
    xDividerPos.current = mouseEvent.clientX;
  };

  useEffect(() => {
    document.addEventListener('mouseup', onMouseHoldUp);
    document.addEventListener('mousemove', onMouseHoldMove);

    return () => {
      document.removeEventListener('mouseup', onMouseHoldUp);
      document.removeEventListener('mousemove', onMouseHoldMove);
    };
  });

  return (
    <div {...props}>
      <SplitPaneContext.Provider
        value={{
          clientHeight,
          setClientHeight,
          clientWidth,
          setClientWidth,
          onMouseHoldDown,
        }}>
        {children}
      </SplitPaneContext.Provider>
    </div>
  );
}

interface ClassNameProps {
  className: string;
}

export const Divider = (props: ClassNameProps) => {
  const { onMouseHoldDown } = useContext(SplitPaneContext);

  return <div {...props} onMouseDown={onMouseHoldDown} />;
};

export const SplitPaneTop = () => {
  const topRef = useRef<HTMLDivElement>(null);
  const { clientHeight, setClientHeight } = useContext(SplitPaneContext);
  const { contents, setCurrContent } = useContext(ContentContext);

  useEffect(() => {
    if (clientHeight === null && topRef.current) {
      setClientHeight(topRef.current.clientHeight);
      return;
    }
    if (topRef.current) {
      console.log(clientHeight);
      topRef.current.style.minHeight = clientHeight + 'px';
      topRef.current.style.maxHeight = clientHeight + 'px';
    }
  }, [clientHeight]);

  return (
    <div
      className="min-h-[300px] flex-1 overflow-hidden text-left"
      ref={topRef}>
      <h1 className="text-2xl">ChatGPT Prompts 模板:</h1>
      <ul className="list-inside list-disc">
        {contents.map((el, i) => {
          return (
            <li className="m-0.5 flex flex-col gap-2" key={i}>
              <Link
                className="text-xl underline decoration-sky-600 hover:decoration-blue-400"
                href=""
                onClick={() => setCurrContent(el.id)}>
                {el.subject}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export const SplitPaneBottom = () => {
  const { contents, currContent } = useContext(ContentContext);
  const content = contents.find((element) => element.id === currContent)!;

  function pageContent() {
    if (content.description === 'delimiter') {
      return <Delimiter />;
    } else if (content.description === 'output-format') {
      return <StructureFormat />;
    } else if (content.description === 'condition') {
      return <Condition />;
    } else if (content.description === 'imitate') {
      return <Imitate />;
    } else {
      // pass
    }
  }

  return <div className="overflow-y-scroll">{pageContent()}</div>;
};

interface SplitPaneLeftProps {
  children: ReactNode;
}

export const SplitPaneLeft = (children: SplitPaneLeftProps) => {
  const topRef = useRef<HTMLDivElement>(null);
  const { clientWidth, setClientWidth } = useContext(SplitPaneContext);

  useEffect(() => {
    if (clientWidth === null && topRef.current) {
      setClientWidth(topRef.current.clientWidth / 2);
      return;
    }
    if (topRef.current) {
      topRef.current.style.minWidth = clientWidth + 'px';
      topRef.current.style.maxWidth = clientWidth + 'px';
    }
  }, [clientWidth]);

  return <div {...children} className="flex-1 overflow-hidden" ref={topRef} />;
};

interface SplitPaneRightProps {
  children: ReactNode;
}

export const SplitPaneRight = ({ children }: SplitPaneRightProps) => {
  // const { contents, currQuote } = useContext(QuoteContext);
  // const quote = contents.find((element) => element.id === currQuote);

  return <div className="flex-1 overflow-hidden">{children}</div>;
};

export default SplitPane;