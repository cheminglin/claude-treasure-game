import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Button } from './components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import AuthModal from '@/components/AuthModal';
import ScoreHistory from '@/components/ScoreHistory';
import Leaderboard from '@/components/Leaderboard';
import keyImage from './assets/key.png';
import closedChest from './assets/treasure_closed.png';
import treasureChest from './assets/treasure_opened.png';
import skeletonChest from './assets/treasure_opened_skeleton.png';
import chestOpenSound from './audios/chest_open.mp3';
import evilLaughSound from './audios/chest_open_with_evil_laugh.mp3';

interface Box {
  id: number;
  isOpen: boolean;
  hasTreasure: boolean;
}

export default function App() {
  const { currentUser, loading, isGuest, logout, saveGameResult } = useAuth();
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [score, setScore] = useState(0);
  const [gameEnded, setGameEnded] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const initializeGame = () => {
    const treasureBoxIndex = Math.floor(Math.random() * 3);
    const newBoxes: Box[] = Array.from({ length: 3 }, (_, index) => ({
      id: index,
      isOpen: false,
      hasTreasure: index === treasureBoxIndex,
    }));
    setBoxes(newBoxes);
    setScore(0);
    setGameEnded(false);
  };

  useEffect(() => {
    initializeGame();
  }, []);

  // Save result to Firestore when game ends (logged-in users only)
  useEffect(() => {
    if (gameEnded && !isGuest && currentUser) {
      const foundTreasure = boxes.some(box => box.isOpen && box.hasTreasure);
      saveGameResult(score, foundTreasure);
    }
  }, [gameEnded]);

  const openBox = (boxId: number) => {
    if (gameEnded) return;

    const target = boxes.find(b => b.id === boxId);
    if (!target || target.isOpen) return;

    new Audio(target.hasTreasure ? chestOpenSound : evilLaughSound).play();

    setBoxes(prevBoxes => {
      const updatedBoxes = prevBoxes.map(box => {
        if (box.id === boxId && !box.isOpen) {
          const newScore = box.hasTreasure ? score + 150 : score - 50;
          setScore(newScore);
          return { ...box, isOpen: true };
        }
        return box;
      });

      const treasureFound = updatedBoxes.some(box => box.isOpen && box.hasTreasure);
      const allOpened = updatedBoxes.every(box => box.isOpen);
      if (treasureFound || allOpened) {
        setGameEnded(true);
      }

      return updatedBoxes;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 flex items-center justify-center">
        <p className="text-amber-800 text-lg">載入中…</p>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthModal />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 flex flex-col items-center justify-center p-8">
      {/* User status bar */}
      <div className="absolute top-4 right-4 flex items-center gap-2 flex-wrap justify-end">
        {isGuest ? (
          <>
            <span className="text-amber-700 text-sm">👻 訪客模式</span>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="border-amber-400 text-amber-800 hover:bg-amber-100 text-xs"
            >
              登入 / 註冊
            </Button>
          </>
        ) : (
          <>
            <span className="text-amber-700 text-sm truncate max-w-[160px]">
              👤 {currentUser.email}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHistory(true)}
              className="border-amber-400 text-amber-800 hover:bg-amber-100 text-xs"
            >
              📜 成績
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowLeaderboard(true)}
              className="border-amber-400 text-amber-800 hover:bg-amber-100 text-xs"
            >
              🏆 排行
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="border-amber-400 text-amber-800 hover:bg-amber-100 text-xs"
            >
              登出
            </Button>
          </>
        )}
      </div>

      <div className="text-center mb-8">
        <h1 className="text-4xl mb-4 text-amber-900">🏴‍☠️ Treasure Hunt Game 🏴‍☠️</h1>
        <p className="text-amber-800 mb-4">
          Click on the treasure chests to discover what's inside!
        </p>
        <p className="text-amber-700 text-sm">
          💰 Treasure: +$150 | 💀 Skeleton: -$50
        </p>
      </div>

      <div className="mb-8">
        <div className="text-2xl text-center p-4 bg-amber-200/80 backdrop-blur-sm rounded-lg shadow-lg border-2 border-amber-400">
          <span className="text-amber-900">Current Score: </span>
          <span className={`${score >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${score}
          </span>
          {gameEnded && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className={`ml-4 ${
                score > 0
                  ? 'text-green-700'
                  : score === 0
                  ? 'text-amber-700'
                  : 'text-red-700'
              }`}
            >
              {score > 0 ? '🎉 勝利！' : score === 0 ? '🤝 平手' : '💀 你輸了'}
            </motion.span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        {boxes.map((box) => (
          <motion.div
            key={box.id}
            className="flex flex-col items-center"
            style={!box.isOpen && !gameEnded ? { cursor: `url(${keyImage}) 8 8, pointer` } : { cursor: 'default' }}
            whileHover={{ scale: box.isOpen ? 1 : 1.05 }}
            whileTap={{ scale: box.isOpen ? 1 : 0.95 }}
            onClick={() => openBox(box.id)}
          >
            <motion.div
              initial={{ rotateY: 0 }}
              animate={{
                rotateY: box.isOpen ? 180 : 0,
                scale: box.isOpen ? 1.1 : 1
              }}
              transition={{
                duration: 0.6,
                ease: "easeInOut"
              }}
              className="relative"
            >
              <img
                src={box.isOpen
                  ? (box.hasTreasure ? treasureChest : skeletonChest)
                  : closedChest
                }
                alt={box.isOpen
                  ? (box.hasTreasure ? "Treasure!" : "Skeleton!")
                  : "Treasure Chest"
                }
                className="w-48 h-48 object-contain drop-shadow-lg"
              />

              {box.isOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="absolute -top-8 left-1/2 transform -translate-x-1/2"
                >
                  {box.hasTreasure ? (
                    <div className="text-2xl animate-bounce">✨💰✨</div>
                  ) : (
                    <div className="text-2xl animate-pulse">💀👻💀</div>
                  )}
                </motion.div>
              )}
            </motion.div>

            <div className="mt-4 text-center">
              {box.isOpen ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, duration: 0.3 }}
                  className={`text-lg p-2 rounded-lg ${
                    box.hasTreasure
                      ? 'bg-green-100 text-green-800 border border-green-300'
                      : 'bg-red-100 text-red-800 border border-red-300'
                  }`}
                >
                  {box.hasTreasure ? '+$150' : '-$50'}
                </motion.div>
              ) : (
                <div className="text-amber-700 p-2">
                  Click to open!
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {gameEnded && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="mb-4 p-6 bg-amber-200/80 backdrop-blur-sm rounded-xl shadow-lg border-2 border-amber-400">
            <h2 className="text-2xl mb-2 text-amber-900">Game Over!</h2>
            <p className="text-lg text-amber-800">
              Final Score:{' '}
              <span className={`${score >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${score}
              </span>
            </p>
            <p className="text-sm text-amber-600 mt-2">
              {boxes.some(box => box.isOpen && box.hasTreasure)
                ? 'Treasure found! Well done, treasure hunter! 🎉'
                : 'No treasure found this time! Better luck next time! 💀'}
            </p>
            {!isGuest && (
              <p className="text-xs text-amber-500 mt-1">✓ 成績已記錄</p>
            )}
          </div>

          <div className="flex gap-3 justify-center flex-wrap">
            <Button
              onClick={initializeGame}
              className="text-lg px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white"
            >
              Play Again
            </Button>
            {!isGuest && (
              <>
                <Button
                  variant="outline"
                  onClick={() => setShowHistory(true)}
                  className="text-lg px-6 py-4 border-amber-400 text-amber-800 hover:bg-amber-100"
                >
                  📜 成績紀錄
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowLeaderboard(true)}
                  className="text-lg px-6 py-4 border-amber-400 text-amber-800 hover:bg-amber-100"
                >
                  🏆 排行榜
                </Button>
              </>
            )}
          </div>
        </motion.div>
      )}

      {showHistory && <ScoreHistory onClose={() => setShowHistory(false)} />}
      {showLeaderboard && <Leaderboard onClose={() => setShowLeaderboard(false)} />}
    </div>
  );
}
