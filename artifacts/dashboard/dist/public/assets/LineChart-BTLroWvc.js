import { g as generateCategoricalChart, X as XAxis, Y as YAxis, f as formatAxisMap } from "./generateCategoricalChart-DKLEOnP6.js";
import { L as Line } from "./Line-sI46cN2w.js";
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
