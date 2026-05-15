import { useEffect, useState } from 'react';
import { collection, query, where, limit, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface GameResult {
  id: string;
  score: number;
  foundTreasure: boolean;
  timestamp: Timestamp;
}

interface Props {
  onClose: () => void;
}

export default function ScoreHistory({ onClose }: Props) {
  const { currentUser } = useAuth();
  const [results, setResults] = useState<GameResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!currentUser) return;
    const q = query(
      collection(db, 'gameResults'),
      where('userId', '==', currentUser.uid),
      limit(50),
    );
    getDocs(q)
      .then((snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as GameResult));
        // Sort client-side to avoid needing a Firestore composite index
        data.sort((a, b) => (b.timestamp?.seconds ?? 0) - (a.timestamp?.seconds ?? 0));
        setResults(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('ScoreHistory error:', err);
        setError(err.message ?? '查詢失敗');
        setLoading(false);
      });
  }, [currentUser]);

  return (
    <div className="fixed inset-0 bg-amber-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-amber-50 rounded-2xl p-6 w-full max-w-lg shadow-2xl border-2 border-amber-300">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-amber-900">📜 我的成績紀錄</h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-amber-700 hover:text-amber-900">
            ✕
          </Button>
        </div>

        {loading ? (
          <p className="text-center text-amber-700 py-8">載入中…</p>
        ) : error ? (
          <div className="py-6 text-center">
            <p className="text-red-600 text-sm mb-2">查詢失敗：{error}</p>
            <p className="text-amber-600 text-xs">請開啟瀏覽器 Console（F12），點擊錯誤中的連結建立 Firestore 索引</p>
          </div>
        ) : results.length === 0 ? (
          <p className="text-center text-amber-700 py-8">還沒有任何紀錄，去玩一場吧！</p>
        ) : (
          <ScrollArea className="h-80">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-amber-700 border-b border-amber-200">
                  <th className="text-left pb-2 font-medium">日期</th>
                  <th className="text-center pb-2 font-medium">結果</th>
                  <th className="text-right pb-2 font-medium">分數</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r.id} className="border-b border-amber-100 hover:bg-amber-100/50">
                    <td className="py-2 text-amber-800 text-xs">
                      {r.timestamp?.toDate().toLocaleDateString('zh-TW', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-2 text-center">
                      {r.foundTreasure ? '💰 找到寶藏' : '💀 骷髏'}
                    </td>
                    <td className={`py-2 text-right font-bold ${r.score >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                      ${r.score}
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
