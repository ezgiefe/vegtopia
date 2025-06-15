import { Dimensions } from "react-native";

// for responsive deign:
const {width: deviceWidth, height: deviceHeight} = Dimensions.get('window');

//height percentage
export const hp = percentage => {
    return (percentage * deviceHeight) / 100;
}

//width percentage
export const wp = percentage => {
    return (percentage * deviceWidth) / 100;
}

export const stripHtmlTags = (html) => {
    return html.replace(/<[^>]*>?/gm, '');
};

