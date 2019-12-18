import React from 'react';
import {
  TextInput,
  SafeAreaView,
  ScrollView,
  Animated,
  Image,
  Dimensions,
  StyleSheet,
  View,
  Text,
  PanResponder,
  Vibration,
  PermissionsAndroid,
} from 'react-native';
import Card from './Card';
import StackView from './StackView';
const DATA = [
  {
    id: 1,
    text: 'Card #1',
    uri:
      'https://images.unsplash.com/photo-1535591273668-578e31182c4f?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=f28261f0564880c9086a57ee87a68887&auto=format&fit=crop&w=500&q=60',
  },
  {
    id: 2,
    text: 'Card #2',
    uri:
      'https://images.unsplash.com/photo-1535576434247-e0f50b766399?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=232f6dbab45b3f3a6f97e638c27fded2&auto=format&fit=crop&w=500&q=60',
  },
  {
    id: 3,
    text: 'Card #3',
    uri:
      'https://images.unsplash.com/photo-1535565454739-863432ea3c0e?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=7edfb9bc7d214dbf2c920723cb0ffce2&auto=format&fit=crop&w=500&q=60',
  },
  {
    id: 4,
    text: 'Card #4',
    uri:
      'https://images.unsplash.com/photo-1535546204504-586398ee6677?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=7320b162b147a94d4c41377d9035e665&auto=format&fit=crop&w=500&q=60',
  },
  {
    id: 5,
    text: 'Card #5',
    uri:
      'https://images.unsplash.com/photo-1535531298052-7457bcdae809?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=f15acb2aedb30131bb287589399185a2&auto=format&fit=crop&w=500&q=60',
  },
  {
    id: 6,
    text: 'Card #6',
    uri:
      'https://images.unsplash.com/photo-1535463731090-e34f4b5098c5?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=ebe64b284c0ccffbac6a0d7ce2c8d15a&auto=format&fit=crop&w=500&q=60',
  },
  {
    id: 7,
    text: 'Card #7',
    uri:
      'https://images.unsplash.com/photo-1535540707939-6b4813adb681?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=ce3177d04728f7d1811e342b47d1e391&auto=format&fit=crop&w=500&q=60',
  },
  {
    id: 8,
    text: 'Card #8',
    uri:
      'https://images.unsplash.com/photo-1535486509975-18366f9825df?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=ea59f63a657824d02872bb907fe85e76&auto=format&fit=crop&w=500&q=60',
  },
];
const {width} = Dimensions.get('screen');
let radius = 30;
const unit = width / 100;
const minAge = 0;
const segmentsLength = 101;
const segmentWidth = 2;
const segmentSpacing = 20;
const snapSegment = segmentWidth + segmentSpacing;
const spacerWidth = (width - segmentWidth) / 2;
const rulerWidth = spacerWidth * 2 + (segmentsLength - 1) * snapSegment;
const indicatorWidth = 100;
const indicatorHeight = 80;
const data = [...Array(segmentsLength).keys()].map(i => i + minAge);

const Ruler = () => {
  return (
    <View style={styles.ruler}>
      {data.map(i => {
        const tenth = i % 10 === 0;
        return (
          <View
            key={i}
            style={[
              styles.segment,
              {
                backgroundColor: '#000000',
                height: 20,
                marginRight: i === data.length - 1 ? 0 : segmentSpacing,
              },
            ]}
          />
        );
      })}
    </View>
  );
};

export default class App extends React.Component {
  scrollViewRef = React.createRef();
  textInputRef = React.createRef();
  state = {
    initialAge: 50,
    saveValue: 0,
    pan: new Animated.ValueXY(),
    dx: 0,
    vibrate: false,
    press: false,
  };

  constructor() {
    super();

    this.state.pan.addListener(value => (this._val = value));

    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (e, gesture) => true,
      onPanResponderMove: Animated.event([
        null,
        {dx: this.state.pan.x, dy: this.state.pan.y},
      ]),
    });

    this._panResponder = PanResponder.create({
      // Ask to be the responder:
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => true,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,

      onPanResponderGrant: (evt, gestureState) => {
        this.setState({press: true});
      },
      onPanResponderMove: (evt, gestureState) => {
        let velY = Math.abs(gestureState.vy);
        console.log(velY);

        let val = Math.round(gestureState.moveX / unit);
        if (gestureState.moveY > 640) {
          this.setState({initialAge: val});
          Animated.event([{x: this.state.pan.x, y: this.state.pan.y}])({
            x: gestureState.dx,
            y: 0,
          });
          this.setState({dx: gestureState.dx});
          this.setState({vibrate: false});
        } else {
          if (!this.state.vibrate) {
            Vibration.vibrate(10);
          }
          this.setState({vibrate: true});
          Animated.event([{x: this.state.pan.x, y: this.state.pan.y}])({
            x: this.state.dx,
            y: gestureState.dy,
          });
        }
      },
      onPanResponderTerminationRequest: (evt, gestureState) => false,
      onPanResponderRelease: (evt, gestureState) => {
        Vibration.vibrate(20);
        this.setState({dx: 0});
        this.setState({press: false});
        if (gestureState.moveY < 500) {
          console.log(this.state.initialAge);
          this.setState({saveValue: this.state.initialAge});
        }

        this.setState({initialAge: 50});
        Animated.spring(this.state.pan, {
          toValue: {x: 0, y: 0},
          friction: 5,
        }).start();
      },
      onPanResponderTerminate: (evt, gestureState) => {
        // Another component has become the responder, so this gesture
        // should be cancelled
      },
      onShouldBlockNativeResponder: (evt, gestureState) => {
        // Returns whether this component should block native components from becoming the JS
        // responder. Returns true by default. Is currently only supported on android.
        return true;
      },
    });
  }

  renderCard(item) {
    return <Card title={item.text} image={{uri: item.uri}}></Card>;
  }

  render() {
    const panStyle = {
      transform: this.state.pan.getTranslateTransform(),
    };
    //console.log(panStyle);
    return (
      <SafeAreaView style={styles.container}>
        <StackView
          data={DATA}
          stackSpacing={40}
          onItemClicked={item => console.log('Data', item)}
          renderItem={item => this.renderCard(item)}
        />
        <Text style={{marginTop: 400}}>
          Money to Save :{this.state.saveValue}
        </Text>
        {this.state.press && (
          <View style={styles.textContainer}>
            <Ruler />
          </View>
        )}

        <View style={styles.indicatorWrapper}>
          <View {...this._panResponder.panHandlers}>
            {this.state.press && (
              <TextInput
                ref={this.textInputRef}
                style={styles.ageTextStyle}
                defaultValue={this.state.initialAge.toString()}
              />
            )}
            <Animated.View
              style={[
                panStyle,
                styles.segment,
                this.state.press
                  ? styles.segmentIndicator
                  : styles.segmentIndicator,
              ]}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  indicatorWrapper: {
    position: 'absolute',
    left: (width - indicatorWidth) / 2,
    bottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
    width: indicatorWidth,
  },
  textContainer: {
    position: 'absolute',
    left: (width - indicatorWidth) / 2,
    bottom: 35,
    alignItems: 'center',
    justifyContent: 'center',
    width: indicatorWidth,
  },
  dropContainer: {
    position: 'absolute',
    left: (width - indicatorWidth) / 2,
    bottom: 140,
    alignItems: 'center',
    justifyContent: 'center',
    width: indicatorWidth,
  },
  segmentIndicator: {
    height: indicatorHeight,
    backgroundColor: 'turquoise',
    width: radius * 2,
    height: radius * 2,
    borderRadius: radius,
  },
  segmentIndicatorPress: {
    height: indicatorHeight,
    backgroundColor: 'turquoise',
    opacity: 0.6,
    width: 40 * 2,
    height: 40 * 2,
    borderRadius: 40,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    position: 'relative',
  },
  ruler: {
    marginTop: 635,
    width: rulerWidth,
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    flexDirection: 'row',
  },
  segment: {
    width: segmentWidth,
    zIndex: 10,
  },
  scrollViewContainerStyle: {
    justifyContent: 'flex-end',
    marginBottom: 50,
  },
  ageTextStyle: {
    fontSize: 42,
    fontFamily: 'Menlo',
  },
  spacer: {
    width: spacerWidth,
    backgroundColor: 'red',
  },
});
