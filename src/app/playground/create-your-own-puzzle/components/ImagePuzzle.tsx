import { useRef } from 'react';
import useDragger from '@/hook/useDragger';
import './ImagePuzzle.css';
import Image from 'next/image';

const ImagePuzzle = ({ imgBlobs }: any) => {
  const imgWidth = 200;
  const imgHeight = 200;

  const zIndexCounter = useRef(1);

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      useDragger(`piece_${i}_${j}`);
    }
  }

  function disableScroll(event: any) {
    event.preventDefault();
    event.stopPropagation();
  }

  function mouseDownAct(e: any) {
    e.preventDefault();
    document.body.addEventListener('scroll', disableScroll); // 不給滾
    // document.body.style.overflow = 'hidden'; // 讓滾動條消失
    zIndexCounter.current++;
    e.target.style.zIndex = zIndexCounter.current;
    console.log(e.target);
  }

  function mouseUpAct(e: any) {
    e.preventDefault();
    document.body.removeEventListener('scroll', disableScroll);
    // document.body.style.overflow = 'auto';
    const style = window.getComputedStyle(e.target);
    // console.log(style);
    const top = parseInt(style.getPropertyValue('top'));
    const left = parseInt(style.getPropertyValue('left'));
    // console.log(top);
    const anwserTopStart = parseInt(
      e.target.getAttribute('data-anwsertopstart'),
    );

    const anwserTopEnd = parseInt(e.target.getAttribute('data-anwsertopend'));

    const anwserLeftStart = parseInt(
      e.target.getAttribute('data-anwserleftstart'),
    );

    const anwserLeftEnd = parseInt(e.target.getAttribute('data-anwserleftend'));

    const tileId = e.target.getAttribute('data-anwsertile');

    const id = e.target.getAttribute('id');

    if (
      anwserTopStart <= top &&
      top <= anwserTopEnd &&
      anwserLeftStart <= left &&
      left <= anwserLeftEnd
    ) {
      const tile = document.getElementById(tileId);
      if (tile) {
        console.log(tile);
        tile.style.backgroundImage = `url(${imgBlobs[id]})`;
        e.target.style.display = 'none';
      }
    }
  }

  const renderPuzzlePieces = () => {
    const puzzlePieces = [];

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        console.log(imgBlobs);
        const puzzlePieceSrc = imgBlobs[`piece_${i}_${j}`];
        const puzzlePieceAlt = `Puzzle Piece piece_${i}_${j}`;

        puzzlePieces.push(
          <Image
            data-anwsertile={`tile_${i}_${j}`}
            data-anwsertopstart={`${j * imgHeight - imgHeight * 0.15}`}
            data-anwsertopend={`${j * imgHeight + imgHeight * 0.15}`}
            data-anwserleftstart={`${i * imgWidth - imgWidth * 0.15}`}
            data-anwserleftend={`${i * imgWidth + imgWidth * 0.15}`}
            id={`piece_${i}_${j}`}
            key={`piece_${i}_${j}`}
            src={puzzlePieceSrc}
            alt={puzzlePieceAlt}
            style={{
              position: 'absolute',
              top: `${Math.random() * 400}px`,
              left: `${Math.random() * 600}px`,
              height: `${imgHeight}px`,
              width: `${imgWidth}px`,
              cursor: 'pointer',
              zIndex: 1,
            }}
            onMouseDown={mouseDownAct}
            onMouseUp={mouseUpAct}
            width={imgWidth}
            height={imgHeight}
          />,
        );
      }
    }
    return puzzlePieces;
  };

  const renderPuzzleTableCell = () => {
    const gridItems = [];
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        gridItems.push(
          <div
            key={`tile_${i}_${j}`}
            id={`tile_${i}_${j}`}
            style={{
              backgroundImage: '',
              backgroundSize: '100% 100%' /* <------ */,
              backgroundRepeat: 'no-repeat',
              backgroundPosition:
                'center center' /* optional, center the image */,
            }}></div>,
        );
      }
    }

    return gridItems;
  };

  return (
    <div
      id="grid"
      style={{
        position: 'relative',
        width: '600px',
        height: '600px',
        border: 'balck',
      }}>
      {renderPuzzlePieces()}
      {renderPuzzleTableCell()}
    </div>
  );
};

export default ImagePuzzle;