import React, {PureComponent} from 'react';
import {View, PanResponder, Animated, Dimensions} from 'react-native';

// type SwipeableViewStackState = {
//   viewPan: Object,
//   viewStackedAnim: Object,
//   currentStackedViewIndex: number,
// };

// type SwipeableViewStackProps = {
//   onSwipe?: Function,
//   initialSelectedIndex?: number,
//   data: Array<Object>,
//   onItemClicked: Function,
//   renderItem: Function,
//   stackSpacing?: number,
// };

const HORIZONTAL_SWIPE_THRESHOLD = 40;
const SCROLL_DISABLE_THRESHOLD = 5;
const CLICK_THRESHOLD = 10;
const SWIPE_ANIM_DURATION = 300;

class StackView extends PureComponent {
  state = {
    viewPan: {},
    viewStackedAnim: {},
    currentStackedViewIndex: 0,
  };
  viewPanResponder = {};
  dataArray = [];
  static defaultProps = {
    initialSelectedIndex: 0,
    onSwipe: undefined,
    stackSpacing: 20,
  };

  constructor(props) {
    super(props);

    this.state = {
      viewPan: new Animated.ValueXY(),
      viewStackedAnim: new Animated.Value(0),
      currentStackedViewIndex: props.initialSelectedIndex
        ? props.initialSelectedIndex
        : 0,
    };

    this.dataArray = props.data;
    this.createviewPanResponder = this.createviewPanResponder.bind(this);
    this.renderSwipeableViews = this.renderSwipeableViews.bind(this);
    this.onItemClicked = this.onItemClicked.bind(this);

    this.createviewPanResponder();
  }

  onItemClicked() {
    this.props.onItemClicked(
      this.dataArray[this.state.currentStackedViewIndex],
    );
  }

  createviewPanResponder() {
    this.viewPanResponder = PanResponder.create({
      // onStartShouldSetPanResponder: () => true,
      // onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderMove: (event, gestureState) => {
        this.state.viewPan.setValue({
          x: gestureState.dx,
          y: this.state.viewPan.y,
        });
      },

      onPanResponderTerminationRequest: () => false,
      onPanResponderRelease: (event, gestureState) => {
        if (this.props.data.length > 0) {
          if (
            gestureState.dx < -HORIZONTAL_SWIPE_THRESHOLD &&
            this.props.data.length > 1
          ) {
            Animated.timing(this.state.viewPan, {
              toValue: 0,
              duration: SWIPE_ANIM_DURATION,
            }).start();

            Animated.timing(this.state.viewStackedAnim, {
              toValue: 1,
              duration: SWIPE_ANIM_DURATION,
            }).start(() => {
              this.state.viewStackedAnim.setValue(0);

              this.setState(
                {
                  currentStackedViewIndex:
                    this.state.currentStackedViewIndex ===
                    this.dataArray.length - 1
                      ? 0
                      : this.state.currentStackedViewIndex + 1,
                },
                () => {
                  if (this.props.onSwipe) {
                    this.props.onSwipe(this.state.currentStackedViewIndex);
                  }
                },
              );
            });
          } else if (
            gestureState.dx > HORIZONTAL_SWIPE_THRESHOLD &&
            this.props.data.length > 1
          ) {
            Animated.timing(this.state.viewPan, {
              toValue: 0,
              duration: SWIPE_ANIM_DURATION,
            }).start();

            Animated.timing(this.state.viewStackedAnim, {
              toValue: 1,
              duration: SWIPE_ANIM_DURATION,
            }).start(() => {
              this.state.viewStackedAnim.setValue(0);

              this.setState(
                {
                  currentStackedViewIndex:
                    this.state.currentStackedViewIndex === 0
                      ? this.dataArray.length - 1
                      : this.state.currentStackedViewIndex - 1,
                },
                () => {
                  if (this.props.onSwipe) {
                    this.props.onSwipe(this.state.currentStackedViewIndex);
                  }
                },
              );
            });
          } else if (
            gestureState.dx > -CLICK_THRESHOLD &&
            gestureState.dx < CLICK_THRESHOLD
          ) {
            this.onItemClicked();
          } else {
            Animated.timing(this.state.viewPan, {
              toValue: 0,
              duration: SWIPE_ANIM_DURATION,
            }).start();
          }
        } else if (
          gestureState.dx > -CLICK_THRESHOLD &&
          gestureState.dx < CLICK_THRESHOLD
        ) {
          this.onItemClicked();
        } else {
          Animated.timing(this.state.viewPan, {
            toValue: 0,
            duration: SWIPE_ANIM_DURATION,
          }).start();
        }
      },

      onPanResponderTerminate: (event, gestureState) => {},
      onShouldBlockNativeResponder: () => false,
    });
  }

  getLastViewIndex() {
    let index = 0;

    if (this.state.currentStackedViewIndex === this.dataArray.length - 2) {
      index = 0;
    } else if (
      this.state.currentStackedViewIndex ===
      this.dataArray.length - 1
    ) {
      index = 1;
    } else {
      index = this.state.currentStackedViewIndex + 2;
    }

    return index;
  }

  renderLastView() {
    const {stackSpacing} = this.props;
    if (this.props.data.length > 2) {
      return (
        <Animated.View
          key={JSON.stringify(this.dataArray[this.getLastViewIndex()])}
          style={{
            zIndex: 1,
            left: this.state.viewStackedAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [stackSpacing * 2, stackSpacing * 1],
            }),
            transform: [
              {
                scale: this.state.viewStackedAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 0.9],
                }),
              },
            ],
            opacity: this.state.viewStackedAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.3, 0.6],
            }),
          }}>
          {this.props.renderItem(this.dataArray[this.getLastViewIndex()])}
        </Animated.View>
      );
    }
    return (
      <Animated.View
        key={'lastView'}
        style={{
          zIndex: 2,
          position: 'absolute',
          left: this.state.viewStackedAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [stackSpacing * 2, stackSpacing * 1],
          }),
          transform: [
            {
              scale: this.state.viewStackedAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.9, 1],
              }),
            },
          ],
          opacity: this.state.viewStackedAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.6, 1],
          }),
        }}>
        {this.props.renderItem(this.state.currentStackedViewIndex)}
      </Animated.View>
    );
  }

  renderSwipeableViews() {
    const {stackSpacing} = this.props;
    return (
      <View style={{paddingTop: stackSpacing * 3, alignItems: 'center'}}>
        {/* {this.renderLastView()} */}

        {this.props.data.length > 1 && (
          <Animated.View
            key={
              this.dataArray[
                this.state.currentStackedViewIndex === this.dataArray.length - 1
                  ? 0
                  : this.state.currentStackedViewIndex + 1
              ]
            }
            style={{
              zIndex: 2,
              position: 'absolute',
              left: this.state.viewStackedAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [stackSpacing * 2, stackSpacing * 1],
              }),
              transform: [
                {
                  scale: this.state.viewStackedAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.9, 1],
                  }),
                },
              ],
              opacity: this.state.viewStackedAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.6, 1],
              }),
            }}>
            {this.props.renderItem(
              this.dataArray[
                this.state.currentStackedViewIndex === this.dataArray.length - 1
                  ? 0
                  : this.state.currentStackedViewIndex + 1
              ],
            )}
          </Animated.View>
        )}

        <Animated.View
          key={JSON.stringify(
            this.dataArray[this.state.currentStackedViewIndex],
          )}
          {...this.viewPanResponder.panHandlers}
          style={[
            {
              zIndex: this.state.viewStackedAnim.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [3, 2, 0],
              }),
              position: 'absolute',
            },
            this.getFrontmostViewTransformation(false),
          ]}>
          {this.props.renderItem(
            this.dataArray[this.state.currentStackedViewIndex],
          )}
        </Animated.View>
      </View>
    );
  }

  getFrontmostViewTransformation(isDummy) {
    const {stackSpacing} = this.props;

    if (this.props.data.length === 2) {
      return {
        transform: [
          {translateX: this.state.viewPan.x},
          {
            scale: this.state.viewStackedAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 0.9],
            }),
          },
        ],
        left: this.state.viewStackedAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [stackSpacing * 1, stackSpacing * 2],
        }),
        opacity: this.state.viewStackedAnim.interpolate({
          inputRange: [0, 1],
          outputRange: isDummy ? [0, 0.6] : [1, 0],
        }),
      };
    }

    return {
      transform: [
        {translateX: this.state.viewPan.x},
        {
          scale: this.state.viewStackedAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 0.8],
          }),
        },
      ],
      left: this.state.viewStackedAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [stackSpacing * 1, stackSpacing * 2],
      }),
      opacity: this.state.viewStackedAnim.interpolate({
        inputRange: [0, 1],
        outputRange: isDummy ? [0, 0.3] : [1, 0],
      }),
    };
  }

  render() {
    return <View>{this.renderSwipeableViews()}</View>;
  }
}

export default StackView;
