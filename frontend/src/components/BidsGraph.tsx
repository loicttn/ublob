import { useEffect, useMemo, useRef } from "react";
import * as echarts from "echarts";

function BidsGraph() {
  const container_ref = useRef<HTMLDivElement>(null);
  const chart_ref = useRef<echarts.ECharts>();

  const config = useMemo((): echarts.EChartsOption => {
    return {
      dataset: [
        {
          source: [
            [28604, 77, 17096869, "Australia", 1990],
            [31163, 77.4, 27662440, "Canada", 1990],
            [1516, 68, 1154605773, "China", 1990],
            [13670, 74.7, 10582082, "Cuba", 1990],
            [28599, 75, 4986705, "Finland", 1990],
            [29476, 77.1, 56943299, "France", 1990],
            [31476, 75.4, 78958237, "Germany", 1990],
            [28666, 78.1, 254830, "Iceland", 1990],
            [1777, 57.7, 870601776, "India", 1990],
            [29550, 79.1, 122249285, "Japan", 1990],
            [2076, 67.9, 20194354, "North Korea", 1990],
            [12087, 72, 42972254, "South Korea", 1990],
            [24021, 75.4, 3397534, "New Zealand", 1990],
            [43296, 76.8, 4240375, "Norway", 1990],
            [10088, 70.8, 38195258, "Poland", 1990],
            [19349, 69.6, 147568552, "Russia", 1990],
            [10670, 67.3, 53994605, "Turkey", 1990],
            [26424, 75.7, 57110117, "United Kingdom", 1990],
            [37062, 75.4, 252847810, "United States", 1990],
          ],
        },
        {
          transform: {
            type: "filter",
            config: { dimension: 4, eq: 1990 },
          },
        },
        {
          transform: {
            type: "filter",
            config: { dimension: 4, eq: 2015 },
          },
        },
      ],
      tooltip: { trigger: "axis", axisPointer: { type: "cross" } },
      xAxis: {
        name: "Time since last blob (sec)",
        nameGap: 35,
        nameTextStyle: { color: "#B7ACDF" },
        nameLocation: "middle",
        type: "value",
        splitLine: { show: false },
        axisLine: { lineStyle: { color: "#382D63" } },
      },
      yAxis: {
        name: "Bid amount (wei)",
        nameGap: 35,
        nameTextStyle: { color: "#B7ACDF" },
        nameLocation: "middle",
        type: "value",
        splitLine: { show: false },
        axisLine: { lineStyle: { color: "#382D63" } },
      },
      series: [
        {
          name: "1990",
          type: "scatter",
          datasetIndex: 1,
          color: "red",
        },
      ],
      visualMap: {
        show: false,
        dimension: 2,
        min: 20000,
        max: 1500000000,
        seriesIndex: [0, 1],
        inRange: {
          symbolSize: [10, 70],
        },
      },
    };
  }, []);

  useEffect(() => {
    const width = parseInt(getComputedStyle(container_ref.current!).width);
    const height = parseInt(getComputedStyle(container_ref.current!).height);
    console.log(width, height);
    chart_ref.current = echarts.init(container_ref.current, null, {
      renderer: "canvas",
      width,
      height,
    });
  }, []);

  useEffect(() => {
    chart_ref.current?.setOption(config);
  }, [config]);

  useEffect(() => {
    const handleResize = () => {
      if (container_ref.current && chart_ref.current) {
        const width = parseInt(getComputedStyle(container_ref.current).width);
        chart_ref.current.resize({ width });
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="bg-light-violet rounded-md p-4 flex flex-col">
      <h2 className="text-white text-base">Value over time</h2>
      <div className="flex w-full h-full">
        <div ref={container_ref} className="flex-1" />
      </div>
    </div>
  );
}

export default BidsGraph;
