import { useState } from "react";

export function OrganicJohnesTab({ farmId }: { farmId: number }) {
  const [x] = useState(0);
  return (
    <div className="p-4 text-sm text-gray-500">
      Johnes stub — farmId={farmId} x={x}
    </div>
  );
}
