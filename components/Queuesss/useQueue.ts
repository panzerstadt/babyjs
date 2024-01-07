import { useEffect, useState } from "react";
import { Queue } from ".";

export const useQueue = <T>() => {
  const [queueInstance, setQueueInstance] = useState<Queue<T>>();
  useEffect(() => {
    setQueueInstance(new Queue());
  }, []);

  return queueInstance;
};
