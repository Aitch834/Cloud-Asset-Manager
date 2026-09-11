export function buildChemistryPicksRowHtml(
  picksByVintage: number[],
  grandTotalPicks: number,
  fontPx: number,
  cellPadding: string,
): string {
  return `
  <table style="width:100%;border-collapse:collapse;font-size:${fontPx}px;margin:-6px 0 14px">
    <tbody><tr>
      <td colspan="2" style="padding:${cellPadding};border:1px solid #d6b89a;background:#f5f5f4;font-weight:600;color:#555">Picks</td>
      ${picksByVintage.map(picks => {
        const singlePick = picks === 1;
        const bg = singlePick ? "#fef3c7" : "#f5f5f4";
        const border = singlePick ? "#fbbf24" : "#d6b89a";
        const label = singlePick ? `&#9888; ${picks}` : (picks > 0 ? String(picks) : "\u2014");
        return `<td style="padding:${cellPadding};border:1px solid ${border};background:${bg};text-align:right;font-family:monospace;font-weight:${singlePick ? 700 : 500};color:${singlePick ? "#92400e" : "#555"}">${label}</td>`;
      }).join("")}
      <td style="padding:${cellPadding};border:1px solid #d6b89a;background:#f5f5f4;text-align:right;font-family:monospace;font-weight:600;color:#555">${grandTotalPicks > 0 ? grandTotalPicks : "\u2014"}</td>
    </tr></tbody>
  </table>`;
}