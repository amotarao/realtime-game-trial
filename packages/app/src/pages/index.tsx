import { initializeApp } from 'firebase/app';
import { doc, getFirestore, onSnapshot, updateDoc } from 'firebase/firestore';
import Head from 'next/head';
import { useEffect, useMemo, useState } from 'react';

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
  const targetDoc = useMemo(() => doc(firestore, 'games', 'trial'), []);
  const [color, setColor] = useState('#000000');
  const [colorMap, setColorMap] = useState<Record<string, string>>({});
  const [localColorMap, setLocalColorMap] = useState<Record<string, string>>({});

  useEffect(() => {
    const unsubscribe = onSnapshot(targetDoc, (snapshot) => {
      const colorMap = snapshot.get('colorMap') as Record<string, string>;
      setColorMap(colorMap || {});
      setLocalColorMap(colorMap || {});
    });

    return () => {
      unsubscribe();
    };
  });

  return (
    <section className="grid grid-cols-1 gap-[40px] py-[20px]">
      <div className="mx-auto grid h-[322px] w-[322px] grid-cols-[repeat(32,1fr)] grid-rows-[repeat(32,1fr)] border">
        {[...Array(32 * 32)].map((_, i) => {
          const x = i % 32;
          const y = Math.floor(i / 32);
          const key = `${x}_${y}`;

          return (
            <div
              key={key}
              className="h-full w-full"
              style={{
                backgroundColor: localColorMap[key] || 'transparent',
              }}
              onClick={(e) => {
                localColorMap[key] = color;
                updateDoc(targetDoc, {
                  [`colorMap.${key}`]: color,
                });
              }}
            ></div>
          );
        })}
      </div>
      <div className="mx-auto w-[322px]">
        <input
          className="h-[80px] w-[80px]"
          type="color"
          value={color}
          onChange={(e) => {
            setColor(e.currentTarget.value);
          }}
        />
      </div>
    </section>
  );
};
