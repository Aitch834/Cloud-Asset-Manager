import { g as generateCategoricalChart, X as XAxis, Y as YAxis, f as formatAxisMap } from "./generateCategoricalChart-C7K1doG7.js";
import { L as Line } from "./Line-CiQpQ0mj.js";
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
