// import { mini_json, json } from './json.js'; // these are imported from index.html

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

const stringToColour = (str) => {
  let hash = 0;
  for (var i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    const v = '00' + value.toString(16);
    color += v.substring(v.length - 2);
  }
  return color;
};

// id?: string
const filterJson = (json, id) => {
  if (id === undefined) {
    return json;
  }

  const recur = (item, id) => {
    if (item.id === id) {
      return item;
    }

    if ((item?.children ?? []).length === 0) {
      return undefined;
    }

    for (let i = 0; i < (item?.children ?? []).length; i++) {
      temp = recur(item.children[i], id);
      if (temp && Array.from(Object.keys(temp)).length !== 0) {
        item.children = [temp];
        return item;
      }
    }
  };

  return recur(json, id);
};

// const addIdIntoJSON = (json) => {
//   const recur = (item) => {
//     if ((item?.children ?? []).length === 0) {
//       item.id = crypto.randomUUID().toString();
//       return item;
//     }

//     for (let i = 0; i < (item?.children ?? []).length; i++) {
//       temp = recur(item.children[i]);
//       item.id = crypto.randomUUID().toString();
//       item.children[i] = temp;
//     }
//     return item;
//   };
//   return recur(json);
// };

// console.log(JSON.stringify(a(structuredClone(json))));

// id?: string
const recursionJson = (jsonObj, id) => {
  const data = [];
  const recur = (item, start = 0, level = 0) => {
    const temp = {
      name: item.id,
      value: [level, start, start + item.value, item.name], // [level, start_val, end_val, name]
      itemStyle: { normal: { color: stringToColour(item.id) } },
    };
    data.push(temp);

    let prevStart = start;
    for (let i = 0; i < (item?.children ?? []).length; i++) {
      recur(item.children[i], prevStart, level + 1);
      prevStart = prevStart + item.children[i].value;
    }
  };
  const filteredJson = filterJson(structuredClone(jsonObj), id);
  recur(filteredJson);
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
      return `${params.marker} ${params.value[3]}: ${params.value[2] - params.value[1]}`;
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

// click event
myChart.on('click', (params) => {
  myChart.setOption({
    ...option,
    series: [{ data: recursionJson(json, params.data.name) }],
  });
});

window.addEventListener('resize', myChart.resize);
