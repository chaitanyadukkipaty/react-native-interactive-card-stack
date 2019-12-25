import React, {Component} from 'react';
import {
  View,
  StyleSheet,
  Image,
  Text,
  PanResponder,
  Animated,
  Slider,
} from 'react-native';

class Card extends Component {
  state = {
    initialAge: 50,
    saveValue: 0,
    pan: new Animated.ValueXY(),
    dx: 0,
    vibrate: false,
    press: false,
    value: 0,
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

      onPanResponderGrant: (evt, gestureState) => {},
      onPanResponderMove: (evt, gestureState) => {
        console.log(gestureState.dx, gestureState.dy);
        Animated.event([{x: this.state.pan.x, y: this.state.pan.y}])({
          x: gestureState.dx,
          y: gestureState.dy,
        });
        this.setState({dx: gestureState.dx});
      },
      onPanResponderTerminationRequest: (evt, gestureState) => false,
      onPanResponderRelease: (evt, gestureState) => {
        console.log(this.state.initialAge);
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
        return false;
      },
    });
  }

  change(value) {
    this.setState(() => {
      return {
        value: parseFloat(value),
      };
    });
  }

  render() {
    return (
      <View style={styles.card}>
        <View style={styles.cover}>
          <Image style={styles.image} source={this.props.image}></Image>
          <Text style={styles.title}>{this.props.title}</Text>
          <Text style={styles.author}></Text>
        </View>
        <View
          {...this._panResponder.panHandlers}
          style={{alignItems: 'flex-end', marginRight: 5, marginTop: 75}}>
          <Animated.View
            style={[
              {
                transform: [{translateX: this.state.pan.x}],
              },
              styles.segment,
              styles.segmentIndicator,
            ]}
          />
        </View>
      </View>
    );
  }
}

const radius = 30;
const styles = StyleSheet.create({
  card: {
    width: 315,
    height: 460,
    borderRadius: 14,
    backgroundColor: '#454545',
    borderColor: '#ffffff',
    borderWidth: 1,
  },
  cover: {
    height: 290,
  },
  image: {
    height: 290,
    width: 315,
    borderRadius: 14,
  },
  title: {
    position: 'absolute',
    top: 20,
    left: 20,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  segmentIndicator: {
    height: 80,
    backgroundColor: 'turquoise',
    width: radius,
    height: radius * 2,
  },
  author: {},
});

export default Card;
