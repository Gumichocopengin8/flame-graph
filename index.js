const json = JSON.parse(
  `{
    "children": [
      {
        "name": "genunix syscall_mstate",
        "value": 79
      },
      {
        "children": [
          {
            "name": "ufs ufs_getpage",
            "value": 10,
            "children": [
              {
                "name": "ufs segvn_unmap",
                "value": 3
              }
            ]
          },
          {
            "name": "unix hwblkclr",
            "value": 7,
            "children": [
              {
                "name": "genunix segvn_unmap",
                "value": 5
              }
            ]
          }
        ],
        "name": "unix page_lookup",
        "value": 21
      }
    ],
    "name": "root",
    "value": 100
  }
  `
);

const dom = document.getElementById('chart-container');
const myChart = echarts.init(dom, null, {
  renderer: 'canvas',
  useDirtyRect: false,
});

const data = [];
const dataCount = 10;
const startTime = 0;
const categories = ['categoryA', 'categoryB', 'categoryC', 'categoryD', 'categoryE'];
const types = [
  { name: 'JS Heap', color: 'orange' },
  { name: 'Documents', color: '#bd6d6c' },
  { name: 'Nodes', color: '#75d874' },
  { name: 'Listeners', color: '#e0bc78' },
  { name: 'GPU Memory', color: '#dc77dc' },
  { name: 'GPU', color: '#72b362' },
];
// Generate mock data
categories.forEach(function (category, index) {
  let baseTime = startTime;
  for (let i = 0; i < dataCount; i++) {
    const typeItem = types[index];
    const duration = (index + 1) * 10000;
    data.push({
      name: typeItem.name,
      value: [index, baseTime, (baseTime += duration)],
      itemStyle: { normal: { color: typeItem.color } },
    });
    baseTime += 2000;
  }
});

const recursionJson = (json) => {
  const data = [];
  const recur = (item, start = 0, level = 0) => {
    const temp = {
      name: item.name,
      value: [level, start, start + item.value], // [level, start, end]
      itemStyle: { normal: { color: 'pink' } },
    };
    data.push(temp);

    let prevStart = start;
    for (let i = 0; i < (item?.children ?? []).length; i++) {
      recur(item.children[i], prevStart, level + 1);
      prevStart = prevStart + item.children[i].value;
    }
  };
  recur(json);
  return data;
};

console.log(recursionJson(json));

const data1 = [
  {
    name: 'root',
    value: [0, 0, 100],
    itemStyle: { normal: { color: 'pink' } },
  },
  {
    name: 'genunix syscall_mstate',
    value: [1, 0, 79],
    itemStyle: { normal: { color: 'blue' } },
  },
  {
    name: 'unix page_lookup',
    value: [1, 79, 100],
    itemStyle: { normal: { color: 'orange' } },
  },
  {
    name: 'ufs ufs_getpage',
    value: [2, 79, 89],
    itemStyle: { normal: { color: 'skyblue' } },
  },
  {
    name: 'unix hwblkclr',
    value: [2, 89, 96],
    itemStyle: { normal: { color: 'gray' } },
  },
  {
    name: 'ufs segvn_unmap',
    value: [3, 79, 82],
    itemStyle: { normal: { color: 'teal' } },
  },
  {
    name: 'genunix segvn_unmap',
    value: [3, 89, 94],
    itemStyle: { normal: { color: 'cyan' } },
  },
];

function renderItem(params, api) {
  const categoryIndex = api.value(0);
  const start = api.coord([api.value(1), categoryIndex]);
  const end = api.coord([api.value(2), categoryIndex]);
  const height = api.size([0, 1])[1];

  return {
    type: 'rect',
    transition: ['shape'],
    shape: {
      x: start[0],
      y: start[1] - height / 2,
      width: end[0] - start[0],
      height: height,
    },
    style: api.style(),
  };
}
const option = {
  tooltip: {
    formatter: (params) => {
      return `${params.marker} ${params.name}: ${params.value[1]}, ${params.value[2]}, ${
        params.value[2] - params.value[1]
      }`;
    },
  },
  xAxis: {
    min: startTime,
    scale: true,
    show: false,
  },
  yAxis: {
    data: [],
    show: false,
  },
  series: [
    {
      type: 'custom',
      renderItem: renderItem,
      encode: {
        x: [0, 1],
        y: 0,
      },
      // data: data,
      // data: data1,
      data: recursionJson(json),
    },
  ],
};

if (option && typeof option === 'object') {
  myChart.setOption(option);
}

window.addEventListener('resize', myChart.resize);
