import React, {PureComponent} from 'react';
import {View, PanResponder, Animated, Easing} from 'react-native';

//Props
//required props
//onClick     -> Click on Item
//data        -> Data to be displayed
//renderItem  -> Way to render data
//option props
//onSwipe     -> Function to call on change of navigation
//startIndex  -> Start from with data Item
//itemSpacing -> Spacing between each rendered Item

const HORIZONTAL_THRESHOLD = 50;
const CLICK_THRESHOLD = 15;
const ANIM_DURATION = 200;

class StackView extends PureComponent {
  state = {
    stackPan: {},
    stackAnim: {},
    currentStackIndex: 0,
  };
  stackPanResponder = {};
  dataList = [];
  static defaultProps = {
    startIndex: 0,
    onSwipe: undefined,
    itemSpacing: 20,
  };
  constructor(props) {
    super(props);
    this.state = {
      stackPan: new Animated.ValueXY(),
      stackAnim: new Animated.Value(0),
      currentStackIndex: props.startIndex ? props.startIndex : 0,
    };

    this.dataList = props.data;
    this.createstackPanResponder = this.createstackPanResponder.bind(this);
    this.renderSwipeableItems = this.renderSwipeableItems.bind(this);
    this.onClick = this.onClick.bind(this);

    this.createstackPanResponder();
  }

  //Action perfomed on swiping Right
  onSwipeRight() {
    Animated.timing(this.state.stackPan, {
      toValue: 0,
      duration: ANIM_DURATION,
    }).start();

    Animated.timing(this.state.stackAnim, {
      toValue: 1,
      duration: ANIM_DURATION,
    }).start(() => {
      this.state.stackAnim.setValue(0);

      this.setState(
        {
          currentStackIndex:
            this.state.currentStackIndex === this.dataList.length - 1
              ? 0
              : this.state.currentStackIndex + 1,
        },
        () => {
          if (this.props.onSwipe) {
            this.props.onSwipe(this.state.currentStackIndex);
          }
        },
      );
    });
  }

  //Action perfomed on swiping Left
  onSwipeLeft() {
    Animated.timing(this.state.stackPan, {
      toValue: 0,
      duration: ANIM_DURATION,
    }).start();

    Animated.timing(this.state.stackAnim, {
      toValue: 1,
      duration: ANIM_DURATION,
    }).start(() => {
      this.state.stackAnim.setValue(0);

      this.setState(
        {
          currentStackIndex:
            this.state.currentStackIndex === 0
              ? this.dataList.length - 1
              : this.state.currentStackIndex - 1,
        },
        () => {
          if (this.props.onSwipe) {
            this.props.onSwipe(this.state.currentStackIndex);
          }
        },
      );
    });
  }

  //Condition to check in User swiped Right
  isRightSwipe(gestureState) {
    return (
      gestureState.dx < -HORIZONTAL_THRESHOLD && this.props.data.length > 1
    );
  }

  //Condition to check in User swiped Left
  isLeftSwipe(gestureState) {
    return gestureState.dx > HORIZONTAL_THRESHOLD && this.props.data.length > 1;
  }

  //Condition to check in User clicked on Item
  isClick(gestureState) {
    return (
      gestureState.dx > -CLICK_THRESHOLD && gestureState.dx < CLICK_THRESHOLD
    );
  }

  //Action to be performed on Click sent by User
  onClick() {
    this.props.onClick(this.dataList[this.state.currentStackIndex]);
  }

  //Action
  onReset() {
    Animated.timing(this.state.stackPan, {
      toValue: 0,
      easing: Easing.linear,
      duration: ANIM_DURATION,
    }).start();
  }

  createstackPanResponder() {
    this.stackPanResponder = PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderMove: (event, gestureState) => {
        this.state.stackPan.setValue({
          x: gestureState.dx,
          y: this.state.stackPan.y,
        });
      },

      onPanResponderTerminationRequest: () => false,
      onPanResponderRelease: (event, gestureState) => {
        if (this.props.data.length > 0) {
          if (this.isRightSwipe(gestureState)) {
            this.onSwipeRight();
          } else if (this.isLeftSwipe(gestureState)) {
            this.onSwipeLeft();
          } else if (this.isClick(gestureState)) {
            this.onClick();
          } else {
            this.onReset();
          }
        } else if (this.isClick(gestureState)) {
          this.onClick();
        } else {
          this.onReset();
        }
      },

      onPanResponderTerminate: (event, gestureState) => {
        if (this.props.data.length > 0) {
          if (this.isRightSwipe(gestureState)) {
            this.onSwipeRight();
          } else if (this.isLeftSwipe(gestureState)) {
            this.onSwipeLeft();
          } else if (this.isClick(gestureState)) {
            this.onClick();
          } else {
            this.onReset();
          }
        } else if (this.isClick(gestureState)) {
          this.onClick();
        } else {
          this.onReset();
        }
      },
      onShouldBlockNativeResponder: () => false,
    });
  }

  getLastItemIndex() {
    let index = 0;

    if (this.state.currentStackIndex === this.dataList.length - 2) {
      index = 0;
    } else if (this.state.currentStackIndex === this.dataList.length - 1) {
      index = 1;
    } else {
      index = this.state.currentStackIndex + 2;
    }

    return index;
  }

  renderSwipeableItems() {
    const {itemSpacing} = this.props;
    return (
      <View style={{paddingTop: itemSpacing * 3, alignItems: 'center'}}>
        {/* Thrid card in user data */}
        {this.props.data.length > 2 && (
          <Animated.View
            key={JSON.stringify(this.dataList[this.getLastItemIndex()])}
            style={{
              zIndex: 1,
              position: 'absolute',
              left: this.state.stackAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [itemSpacing * 3, itemSpacing * 2],
              }),
              transform: [
                {
                  scale: this.state.stackAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 0.9],
                  }),
                },
              ],
              opacity: this.state.stackAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 0.6],
              }),
            }}>
            {this.props.renderItem(this.dataList[this.getLastItemIndex()])}
          </Animated.View>
        )}

        {/* Second card in user data */}
        {this.props.data.length > 1 && (
          <Animated.View
            key={
              this.dataList[
                this.state.currentStackIndex === this.dataList.length - 1
                  ? 0
                  : this.state.currentStackIndex + 1
              ]
            }
            style={{
              zIndex: 2,
              position: 'absolute',
              left: this.state.stackAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [itemSpacing * 2, itemSpacing * 1],
              }),
              transform: [
                {
                  scale: this.state.stackAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.9, 1],
                  }),
                },
              ],
              opacity: this.state.stackAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.6, 1],
              }),
            }}>
            {this.props.renderItem(
              this.dataList[
                this.state.currentStackIndex === this.dataList.length - 1
                  ? 0
                  : this.state.currentStackIndex + 1
              ],
            )}
          </Animated.View>
        )}
        {/*Firstmost Card in User data*/}
        <Animated.View
          key={JSON.stringify(this.dataList[this.state.currentStackIndex])}
          {...this.stackPanResponder.panHandlers}
          style={[
            {
              zIndex: this.state.stackAnim.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [3, 2, 0],
              }),
              position: 'absolute',
            },
            this.getFrontmostViewTransformation(false),
          ]}>
          {this.props.renderItem(this.dataList[this.state.currentStackIndex])}
        </Animated.View>
      </View>
    );
  }

  getFrontmostViewTransformation(isDummy) {
    const {itemSpacing} = this.props;

    if (this.props.data.length === 2) {
      return {
        transform: [
          {translateX: this.state.stackPan.x},
          {
            scale: this.state.stackAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 0.9],
            }),
          },
        ],
        left: this.state.stackAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [itemSpacing * 1, itemSpacing * 2],
        }),
        opacity: this.state.stackAnim.interpolate({
          inputRange: [0, 1],
          outputRange: isDummy ? [0, 0.6] : [1, 0],
        }),
      };
    }

    return {
      transform: [
        {translateX: this.state.stackPan.x},
        {
          scale: this.state.stackAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 0.8],
          }),
        },
      ],
      left: this.state.stackAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [itemSpacing * 1, itemSpacing * 2],
      }),
      opacity: this.state.stackAnim.interpolate({
        inputRange: [0, 1],
        outputRange: isDummy ? [0, 0.3] : [1, 0],
      }),
    };
  }

  render() {
    return <View>{this.renderSwipeableItems()}</View>;
  }
}

export default StackView;

