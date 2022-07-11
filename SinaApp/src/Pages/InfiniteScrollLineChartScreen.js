// import React from 'react';
// import {
//   AppRegistry,
//   StyleSheet,
//   Text,
//   Button,
//   View,
//   processColor,
// } from 'react-native';
// import update from 'immutability-helper';

// import {LineChart} from 'react-native-charts-wrapper';
import {data150 as ecgData} from '../data/data';

// const distanceToLoadMore = 10;
// const pageSize = 5000;

// class InfiniteScrollLineChartScreen extends React.Component {
//   constructor() {
//     super();

//     this.isLoading = false;
//     this.xMin = 0;
//     this.xMax = 0;

//     this.state = {
//       data: {},
//     };
//   }

//   componentDidMount() {
//     let _this = this;
//     this.mockLoadDataFromServer(0, pageSize).then(function (data) {
//       _this.setState({
//         data: data,
//         visibleRange: {x: {min: 25, max: 50}},
//       });
//     });
//     // this.refs.chart.moveViewToAnimated(1000, 0, 'left', 30000);
//   }

//   mockLoadDataFromServer(from, to) {
//     let _this = this;
//     return new Promise(function (resolve) {
//       setTimeout(function () {
//         _this.xMin = from;
//         _this.xMax = to;

//         console.log('load data from ' + from + ' to ' + to);
//         resolve({
//           dataSets: [
//             {
//               values: Array.from(
//                 new Array(parseInt(to - from)),
//                 (val, index) => ({
//                   x: from + index,
//                   y: Number(ecgData[from + index]),
//                 }),
//               ),
//               label: 'sin',
//               config: {color: processColor('blue'), drawCircles: false},
//             },
//           ],
//         });
//       }, 50);
//     });
//   }

//   handleChange(event) {
//     let nativeEvent = event.nativeEvent;

//     let _this = this;

//     if (nativeEvent.action == 'chartTranslated') {
//       let {left, right, centerX} = nativeEvent;

//       console.log(
//         'data is from ' +
//           _this.xMin +
//           ' to ' +
//           _this.xMax +
//           ' left ' +
//           left +
//           ' right ' +
//           right +
//           ' isLoading ' +
//           _this.isLoading,
//       );
//       if (!_this.isLoading) {
//         if (
//           _this.xMin > left - distanceToLoadMore ||
//           right + distanceToLoadMore > _this.xMax
//         ) {
//           _this.isLoading = true;

//           // Because of the implementation of MpAndroidChart, if the action of setDataAndLockIndex is triggered by user dragging,
//           // then the size of new data should be equal to original data, otherwise the calculation of position transition won't be accurate,
//           // use may find the chart suddenly blink to another position.
//           // This restriction only exists in android, in iOS, we have no such problem.

//           _this
//             .mockLoadDataFromServer(centerX - pageSize, centerX + pageSize)
//             .then(function (data) {
//               _this.refs.chart.setDataAndLockIndex(data);

//               _this.isLoading = false;
//             });
//         }
//       }
//     }
//   }

//   render() {
//     return (
//       <View style={{flex: 1}}>
//         <View style={styles.container}>
//           <LineChart
//             style={styles.chart}
//             data={this.state.data}
//             xAxis={this.state.xAxis}
//             yAxis={this.state.yAxis}
//             visibleRange={this.state.visibleRange}
//             dragDecelerationEnabled={false}
//             ref="chart"
//             // onChange={this.handleChange.bind(this)}
//           />
//         </View>
//       </View>
//     );
//   }
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F5FCFF',
//   },
//   chart: {
//     flex: 1,
//   },
// });

// export default InfiniteScrollLineChartScreen;

// =============================================================================
import React, {Component} from 'react';
import {StyleSheet, processColor} from 'react-native';
import RNFS from 'react-native-fs';
import {LineChart} from 'react-native-charts-wrapper';
import {Dirs, FileSystem} from 'react-native-file-access';

const colors = [processColor('red')];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'stretch',
    backgroundColor: 'transparent',
  },
});

export default class LiveUpdating extends Component {
  static displayName = 'LiveUpdating';

  constructor(props) {
    super(props);
    this.index = 0;
    this.currentIndex = 0;
    this.toIndex = 600;
    this.moveTo = 500;
    this.temp = [];
    this.state = {
      values: [ecgData[this.index]],
      colorIndex: 0,
      marker: {
        enabled: true,
        digits: 1,
        backgroundTint: processColor('teal'),
        markerColor: processColor('#F0C0FF8C'),
        textColor: processColor('white'),
      },
      visibleRange: {x: {min: 300, max: 5000}},
    };
    this.path = RNFS.ExternalDirectoryPath + '/test.csv';
  }

  next(values, colorIndex) {
    return {
      data: {
        dataSets: [
          {
            values: values,
            label: 'Sine function',

            config: {
              drawValues: false,
              color: colors[colorIndex],
              mode: 'CUBIC_BEZIER',
              drawCircles: false,
              lineWidth: 2,
            },
          },
        ],
      },
      xAxis: {
        axisLineWidth: 0,
        drawLabels: false,
        position: 'BOTTOM',
        drawGridLines: false,
      },
    };
  }

  async componentDidMount() {
    // this.interval = setInterval(() => {
    //   if (this.index >= 5000) {
    //     // this.refs.chart.moveViewToAnimated(200, 0, 'left', 2000);
    //     clearInterval(this.interval);
    //     FileSystem.appendFile(this.path, this.state.values.toString(), 'utf8')
    //       .then(success => {
    //         console.log('FILE WRITTEN!:: FINAL');
    //       })
    //       .catch(err => {
    //         console.log(err.message);
    //       });
    //   } else if (this.index % 1500 == 0) {
    //     // FileSystem.appendFile(this.path, this.state.values.toString(), 'utf8')
    //     //   .then(success => {
    //     //     console.log('FILE WRITTEN!');
    //     //     this.setState({
    //     //       values: [ecgData[this.index]],
    //     //     });
    //     //   })
    //     //   .catch(err => {
    //     //     console.log(err.message);
    //     //   });
    //   } else {
    //     this.setState({
    //       values: this.state.values.concat(
    //         // ecgData.slice(this.currentIndex, this.toIndex),
    //         [ecgData[this.index]],
    //       ),
    //     });
    //   }

    //   // if (this.toIndex == 1500) {
    //   //   this.interval2 = setInterval(() => {
    //   //     if ((this.moveTo = 5000)) {
    //   //       clearInterval(this.interval2);
    //   //       return;
    //   //     }
    //   //     this.moveTo += 500;
    //   //   }, 1000);
    //   // }
    //   // if (this.toIndex >= 2500) {
    //   //   console.log('move left bitch');
    //   //   // this.refs.chart.moveViewToAnimated(5000 - 1800, 0, 'left', 5000);
    //   //   setTimeout(() => {
    //   //     this.setState({
    //   //       values: this.state.values.slice(300, this.currentIndex),
    //   //     });
    //   //   }, 1000);
    //   // }
    //   this.index += 15;
    //   // this.currentIndex = this.toIndex;
    //   // this.toIndex = this.toIndex + 150;
    // }, 1000 / 150);

    //===============================================
    this.interval = setInterval(() => {
      if (this.toIndex >= 5000) {
        this.currentIndex = 0;
        this.toIndex = 150;
        this.temp = this.temp.slice(2000);
        this.index = this.index - 2000;
        this.setState({
          values: this.state.values.slice(4000),
        });
        console.log(this.temp.length);
      } else {
        this.temp = this.temp.concat(
          ecgData.slice(this.currentIndex, this.toIndex + 1),
        );
        this.currentIndex = this.toIndex;
        this.toIndex += 150;
      }
    }, 1000);
    this.timeOutInterval = setTimeout(() => {
      this.interval2 = setInterval(() => {
        // if (this.index >= 150) {
        //   // console.log(
        //   //   'this.index = ',
        //   //   this.index,
        //   //   ' this.toIndex = ',
        //   //   this.toIndex,
        //   // );
        //   this.temp = this.temp.slice(150);
        //   console.log(this.temp.length);
        //   this.index = 0;
        //   this.setState({
        //     values: [this.temp[this.index]],
        //   });
        // } else {
        if (this.index >= this.temp.length) {
          this.setState({
            values: this.state.values.concat([0]),
          });
        } else {
          this.setState({
            values: this.state.values.concat([this.temp[this.index]]),
          });
          this.index += 4;
        }
        // }
      }, 1000 / 150);
    }, 4000);

    // FileSystem.appendFile(this.path, this.temp.toString(), 'utf8')
    //   .then(success => {
    //     console.log('FILE WRITTEN');
    //   })
    //   .catch(err => {
    //     console.log(err.message);
    //   });
  }

  componentWillUnmount() {
    clearInterval(this.interval);
    clearInterval(this.interval2);
  }

  render() {
    const {values, colorIndex} = this.state;
    const config = this.next(values, colorIndex);

    return (
      <LineChart
        data={config.data}
        xAxis={config.xAxis}
        yAxis={{
          left: {
            enabled: true,
            axisMaximum: 5,
            axisMinimum: -1,
            drawGridLines: false,
          },
          right: {enabled: false},
        }}
        style={styles.container}
        // marker={this.state.marker}
        visibleRange={this.state.visibleRange}
        ref="chart"
      />
    );
  }
}

// =====================================================================
// import React, {Component} from 'react';
// import {StyleSheet, processColor} from 'react-native';

// import {LineChart} from 'react-native-charts-wrapper';

// const colors = [processColor('red')];

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'stretch',
//     backgroundColor: 'transparent',
//   },
// });

// export default class LiveUpdating extends Component {
//   static displayName = 'LiveUpdating';

//   constructor(props) {
//     super(props);
//     this.index = 0;
//     this.state = {
//       values: [ecgData[this.index]],
//       colorIndex: 0,
//       marker: {
//         enabled: true,
//         digits: 2,
//         backgroundTint: processColor('teal'),
//         markerColor: processColor('#F0C0FF8C'),
//         textColor: processColor('white'),
//       },
//     };
//   }

//   next(values, colorIndex) {
//     return {
//       data: {
//         dataSets: [
//           {
//             values: values,
//             label: 'Sine function',

//             config: {
//               drawValues: false,
//               color: colors[colorIndex],
//               mode: 'CUBIC_BEZIER',
//               drawCircles: false,
//               lineWidth: 1,
//             },
//           },
//         ],
//       },
//       xAxis: {
//         axisLineWidth: 0,
//         drawLabels: false,
//         position: 'BOTTOM',
//         drawGridLines: false,
//       },
//     };
//   }

//   componentDidMount() {
//     this.interval = setInterval(() => {
//       if (this.state.values.length >= 5000) {
//         // https://github.com/PhilJay/MPAndroidChart/issues/2450
//         // MpAndroidChart 3.0.2 will crash when data entry list is empty.
//         clearInterval(this.interval);
//         // this.index = 0;
//         // this.refs.chart.highlights([]);
//         // this.setState({values: [this.index]});
//       } else {
//         this.setState({
//           values: this.state.values.concat([ecgData[this.index]]),
//         });
//         this.index++;
//       }
//     }, 1000 / 150);
//   }

//   componentWillUnmount() {
//     clearInterval(this.interval);
//   }

//   render() {
//     const {values, colorIndex} = this.state;
//     const config = this.next(values, colorIndex);
//     return (
//       <LineChart
//         data={config.data}
//         xAxis={config.xAxis}
//         yAxis={{
//           left: {
//             enabled: true,
//             axisMaximum: 2,
//             axisMinimum: -1,
//             drawGridLines: false,
//           },
//           right: {enabled: false},
//         }}
//         style={styles.container}
//         ref="chart"
//         visibleRange={{x: {min: 2000, max: 20000}}}
//       />
//     );
//   }
// }
