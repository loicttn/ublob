import { useCallback, useEffect, useMemo, useRef } from "react";
import * as echarts from "echarts";
import useHead from "../hooks/useHead";
import { getUBlobBidWei } from "../utils/blob";

function BidsGraph() {
  const { data } = useHead();

  const container_ref = useRef<HTMLDivElement>(null);
  const chart_ref = useRef<echarts.ECharts>();

  const getSize = useCallback(
    (blob: [number, number]) =>
      5 +
      (data?.biggest_blob && data?.smallest_blob
        ? (50 * blob[1]) / getUBlobBidWei(data.biggest_blob)
        : 0),
    [data]
  );

  const config = useMemo((): echarts.EChartsOption => {
    return {
      xAxis: {
        name: "Time since last blob (sec)",
        nameTextStyle: { color: "#B7ACDF" },
        nameLocation: "middle",
        type: "value",
        min:
          [...(data?.all_blobs ?? [])].sort(
            (a, b) => a.CreationTimestamp - b.CreationTimestamp
          )[0]?.CreationTimestamp - 10,
        axisTick: { show: true },
        axisLabel: { show: false },
        splitLine: { show: false },
        axisLine: { lineStyle: { color: "#382D63" } },
      },
      yAxis: {
        name: "Bid amount (wei)",
        nameTextStyle: { color: "#B7ACDF" },
        axisLabel: { show: false },
        nameLocation: "middle",
        axisTick: { show: true },
        type: "value",
        splitLine: { show: false },
        axisLine: { lineStyle: { color: "#382D63" } },
      },
      series: [
        {
          name: "Accepted",
          type: "scatter",
          tooltip: { show: false },
          symbolSize: getSize,
          color: "rgb(16,185,129)",
          data: data?.accepted_blobs.map((blob) => [
            blob.CreationTimestamp,
            getUBlobBidWei(blob),
            blob.ID,
            "toot",
          ]),
        },
        {
          name: "Pending",
          type: "scatter",
          tooltip: { show: false },
          color: "#B7ACDF",
          symbolSize: getSize,
          data: data?.pending_blobs.map((blob) => [
            blob.CreationTimestamp,
            getUBlobBidWei(blob),
            blob.ID,
            "toot",
          ]),
        },
      ],
    };
  }, [data, getSize]);

  useEffect(() => {
    const width = parseInt(getComputedStyle(container_ref.current!).width);
    const height = parseInt(getComputedStyle(container_ref.current!).height);
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

      <div ref={container_ref} className="flex-1" />
    </div>
  );
}

export default BidsGraph;
