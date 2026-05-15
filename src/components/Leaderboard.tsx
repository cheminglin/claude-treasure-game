import { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface UserScore {
  id: string;
  email: string;
  bestScore: number;
  gamesPlayed: number;
}

interface Props {
  onClose: () => void;
}

function getMedal(index: number) {
  if (index === 0) return '🥇';
  if (index === 1) return '🥈';
  if (index === 2) return '🥉';
  return `${index + 1}.`;
}

export default function Leaderboard({ onClose }: Props) {
  const [scores, setScores] = useState<UserScore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'users'),
      orderBy('bestScore', 'desc'),
      limit(10),
    );
    getDocs(q).then((snap) => {
      setScores(snap.docs.map((d) => ({ id: d.id, ...d.data() } as UserScore)));
      setLoading(false);
    });
  }, []);

  return (
    <div className="fixed inset-0 bg-amber-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-amber-50 rounded-2xl p-6 w-full max-w-lg shadow-2xl border-2 border-amber-300">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-amber-900">🏆 排行榜 Top 10</h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-amber-700 hover:text-amber-900">
            ✕
          </Button>
        </div>

        {loading ? (
          <p className="text-center text-amber-700 py-8">載入中…</p>
        ) : scores.length === 0 ? (
          <p className="text-center text-amber-700 py-8">還沒有玩家紀錄，成為第一名吧！</p>
        ) : (
          <ScrollArea className="h-80">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-amber-700 border-b border-amber-200">
                  <th className="text-left pb-2 font-medium">排名</th>
                  <th className="text-left pb-2 font-medium">玩家</th>
                  <th className="text-center pb-2 font-medium">場次</th>
                  <th className="text-right pb-2 font-medium">最高分</th>
                </tr>
              </thead>
              <tbody>
                {scores.map((s, i) => (
                  <tr
                    key={s.id}
                    className={`border-b border-amber-100 ${i < 3 ? 'bg-amber-100/60' : 'hover:bg-amber-100/30'}`}
                  >
                    <td className="py-2 text-lg w-10">{getMedal(i)}</td>
                    <td className="py-2 text-amber-800 max-w-[160px] truncate">
                      {s.email.split('@')[0]}
                    </td>
                    <td className="py-2 text-center text-amber-700">{s.gamesPlayed}</td>
                    <td className={`py-2 text-right font-bold ${s.bestScore >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                      ${s.bestScore}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}
