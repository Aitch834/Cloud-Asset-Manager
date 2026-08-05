import { g as generateCategoricalChart, X as XAxis, Y as YAxis, f as formatAxisMap } from "./generateCategoricalChart-btWuYuUC.js";
import { L as Line } from "./Line-CPGQQQ0h.js";
var LineChart = generateCategoricalChart({
  chartName: "LineChart",
  GraphicalChild: Line,
  axisComponents: [{
    axisType: "xAxis",
    AxisComp: XAxis
  }, {
    axisType: "yAxis",
    AxisComp: YAxis
  }],
  formatAxisMap
});
export {
  LineChart as L
};
