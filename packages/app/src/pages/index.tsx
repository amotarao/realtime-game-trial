import { initializeApp } from 'firebase/app';
import { doc, getFirestore, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import Head from 'next/head';
import { useCallback, useEffect, useMemo, useState } from 'react';

const firebaseConfig = {
  apiKey: 'AIzaSyB9Q4MInEqTU_JYL3ZQ_Gx9biZ8UcM1kWw',
  authDomain: 'realtime-game-trial-4f4ec.firebaseapp.com',
  projectId: 'realtime-game-trial-4f4ec',
  storageBucket: 'realtime-game-trial-4f4ec.appspot.com',
  messagingSenderId: '111178954224',
  appId: '1:111178954224:web:5735d354936ad09bb09935',
};
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

export default function Home() {
  return (
    <>
      <Head>
        <title>realtime-game-trial</title>
      </Head>
      <Game />
    </>
  );
}

const Game: React.FC = () => {
  const dot = 12;
  const targetDoc = useMemo(() => doc(firestore, 'games', 'trial'), []);
  const [color, setColor] = useState('#000000');
  const [colorMap, setColorMap] = useState<Record<string, string>>({});
  const [localColorMap, setLocalColorMap] = useState<Record<string, string>>({});

  useEffect(() => {
    const unsubscribe = onSnapshot(targetDoc, (snapshot) => {
      if (!snapshot.exists()) {
        setDoc(targetDoc, { colorMap: {} }, { merge: true });
        return;
      }

      const colorMap = snapshot.get('colorMap') as Record<string, string> | undefined;
      setColorMap(colorMap || {});
      setLocalColorMap(colorMap || {});
    });

    return () => {
      unsubscribe();
    };
  }, [targetDoc]);

  const getPosition = useCallback((index: number) => {
    const x = index % dot;
    const y = Math.floor(index / dot);
    return { x, y };
  }, []);

  const getCurrentColor = useCallback(
    (x: number, y: number) => {
      const key = `${x}_${y}`;
      const currentColor = localColorMap[key];
      return currentColor;
    },
    [localColorMap]
  );

  const pushColor = useCallback(
    (index: number, color: string) => {
      const { x, y } = getPosition(index);
      const key = `${x}_${y}`;
      const currentColor = getCurrentColor(x, y);

      if (color === currentColor) {
        return;
      }

      setLocalColorMap((colorMap) => {
        colorMap[key] = color;
        return colorMap;
      });
      updateDoc(targetDoc, {
        [`colorMap.${key}`]: color,
      });
    },
    [targetDoc, getPosition, getCurrentColor]
  );

  return (
    <section className="grid grid-cols-1 gap-[20px] py-[20px]">
      <div
        className="mx-auto grid h-[320px] w-[320px] grid-cols-[repeat(var(--dot),1fr)] grid-rows-[repeat(var(--dot),1fr)] shadow [&>div]:h-full [&>div]:w-full [&>div]:bg-[var(--color)]"
        style={
          {
            '--dot': dot,
          } as React.CSSProperties
        }
        onClick={(e) => {
          const i = Array.from(e.currentTarget.childNodes).findIndex((elm) => elm === e.target);
          pushColor(i, color);
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          const i = Array.from(e.currentTarget.childNodes).findIndex((elm) => elm === e.target);
          pushColor(i, 'transparent');
        }}
      >
        {[...Array(dot * dot)].map((_, i) => {
          const { x, y } = getPosition(i);
          const currentColor = getCurrentColor(x, y);

          return (
            <div
              key={i}
              style={
                {
                  '--color': currentColor || 'transparent',
                } as React.CSSProperties
              }
            />
          );
        })}
      </div>
      <div className="mx-auto w-[320px]">
        <div className="shadow">
          <input
            className="block h-[80px] w-full [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-0"
            type="color"
            value={color}
            onChange={(e) => {
              setColor(e.currentTarget.value);
            }}
          />
        </div>
      </div>
    </section>
  );
};
