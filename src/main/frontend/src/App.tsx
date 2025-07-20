import React, { useEffect, useState } from 'react';
import axios from 'axios';

const App: React.FC = () => {
  const [data, setData] = useState<string>(''); // 데이터 타입을 string으로 지정

  useEffect(() => {
    axios
        .get<string>('/api/data') // 응답 데이터 타입도 string으로 명시
        .then((res: { data: React.SetStateAction<string>; }) => setData(res.data))
        .catch((err: any) => console.error(err));
  }, []);

  return <div>받아온 값 : {data}</div>;
};

export default App;
