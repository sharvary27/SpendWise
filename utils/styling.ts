import { Dimensions, PixelRatio } from 'react-native';

const { width : SCREEN_WIDTH, height : SCREEN_HEIGHT} = Dimensions.get('window');
const [shortDimension, longDimension] = SCREEN_WIDTH < SCREEN_HEIGHT ? [SCREEN_WIDTH, SCREEN_HEIGHT] : [SCREEN_HEIGHT,SCREEN_WIDTH]

//Default guideline sizes are based on standard ~5" screen mobile device
const guidelineBaseWidth = 350;
const guidelineBaseHeight = 680;

export const scale = (size : number) =>
    Math.round(
        PixelRatio.roundToNearestPixel(
            (shortDimension / guidelineBaseWidth) * (size as number)
        )
    );


export const verticalScale = (size : number) =>
    Math.round(
        PixelRatio.roundToNearestPixel(
            (longDimension / guidelineBaseHeight) * (size as number)
        )
    );