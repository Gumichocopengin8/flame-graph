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

const getRandomColor = () => {
  const colors = ['#893448', '#d95850', '#eb8146', '#ffb248', '#f2d643', '#ebdba4'];
  const index = Math.floor(Math.random() * colors.length);
  return colors[index];
};

const recursionJson = (json) => {
  const data = [];
  const recur = (item, start = 0, level = 0) => {
    const temp = {
      name: item.name,
      value: [level, start, start + item.value, item.name], // [level, start_val, end_val, name]
      itemStyle: { normal: { color: getRandomColor() } },
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

const renderItem = (params, api) => {
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
    style: api.style({
      text: api.value(3),
      textFill: 'blue',
    }),
  };
};
const option = {
  tooltip: {
    formatter: (params) => {
      return `${params.marker} ${params.name}: ${params.value[2] - params.value[1]}`;
    },
  },
  title: [
    {
      text: 'Flame Chart',
      left: 'center',
      top: 10,
      textStyle: {
        fontWeight: 'normal',
        fontSize: 20,
      },
    },
  ],
  xAxis: {
    min: 0,
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
      data: recursionJson(json),
    },
  ],
};

if (option && typeof option === 'object') {
  myChart.setOption(option);
}

window.addEventListener('resize', myChart.resize);
