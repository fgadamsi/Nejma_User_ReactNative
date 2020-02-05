import React, { Component } from 'react';
import {
	View,
	Text,
	SafeAreaView,
	TouchableOpacity,
	Dimensions,
	TextInput,
	Image
} from 'react-native';
import { verticalScale, moderateScale, scale, ScaledSheet } from 'react-native-size-matters';
import fontFamily from '../theme/fontFamily';
import fontWeight from '../theme/fontWeight';
// import { connect } from 'react-redux';
// import Header from '../../components/Header';
// import strings from '../../helpers/lang';
// import imagePath from '../../helpers/imagePath'
import { Rating, AirbnbRating } from 'react-native-ratings';
import colors from '../theme/colors';
const { width, height } = Dimensions.get('window');
export class RatingScreen extends Component {
	state = {
		rating: "",
		comment: '',
		isLoading: false,
		isDisabled: false
	};
	componentDidMount() {
		const techData = this.props.navigation.getParam('technicianData');
		console.log(techData, 'the techdata i get is as follow');
	}
	onPressRight = () => {
		this.props.navigation.goBack();
	};

	onPressLeft = () => {
		this.props.navigation.openDrawer();
	};
	_onFinishRating = rating => {
		this.setState({ rating });
	};
	_onChangeText = comment => {
		this.setState({ comment });
	};
	back = () => {
		let { actions } = this.props;
		// actions.toggleButton(false);
		this.props.navigation.goBack(null);
		// this.props.navigator.pop();
	};

	errorMethod = error => {
		if (error && error.response && error.response.status !== 401) {
			this.setState({ isLoading: false });
			const errorMsg =
				(error && error.response && error.response.data && error.response.data.message) ||
				'Network Error';
			showMessage({
				message: errorMsg,
				type: 'danger',
				icon: 'danger'
			});
		}
	};

	ratingSubmit = () => {
		const orderId = this.props.navigation.getParam('orderId');
		const { rating, comment, isDisabled } = this.state;
		// this.setState({ isLoading: true });
		if(rating==""){
			alert('Please provide rating')
		}
		
	};

	render() {
		const { rating, comment,isDisabled } = this.state;

		return (
			<SafeAreaView style={{backgroundColor: colors.themeHeader,flex:1}}>
				<View style={styles.headerBackGround}>
					<View
						style={{
							justifyContent: 'space-between',
							marginHorizontal: moderateScale(24),
							flexDirection: 'row',
							marginTop: moderateScale(20)
						}}
					>
						<TouchableOpacity
							disabled={isDisabled}
							hitSlop={{ top: 7, left: 7, bottom: 7, right: 7 }}
							style={{ height: 20, width: 24, justifyContent: 'center' }}
						>
							{/* <Image source={require('./../Images/icBack.png')} style={{height: 14, width:18}}/> */}
						</TouchableOpacity>
						<Text style={styles.editProfileText}>Rating</Text>
						<TouchableOpacity
							disabled={isDisabled}
							onPress={() => {
								this.back();
							}}
						>
							<Image source={require('./../Images/ic_close_login.png')} />
						</TouchableOpacity>
					</View>
					{/* <Text style={styles.editProfileInfo}>{strings('editProfile.editProfileInfo')}</Text> */}
				</View>
				<View style={styles.containerBorder}>
					<View style={{ paddingHorizontal: 16, marginTop: 28 }}>
						{/* <Text style={{ ...commonStyles.font12_5, color: colors.themeMain, textAlign }}>
						{strings.WHAT_IS_YOUR_RATING_FOR_SERVICE_PROVIDER}
					</Text> */}
						<View
							style={{
								marginTop: 25,
								marginBottom: 35
							}}
						>
							<AirbnbRating
								count={5}
								reviews={[]}
								showRating={false}
								defaultRating={0}
								size={25}
								onFinishRating={this._onFinishRating}
							/>
						</View>
						<View style={styles.inputMainView}>
							<Text style={styles.inputLabel}>{'Comment'}</Text>
							<TextInput
								style={styles.textInputStyle}
								selectionColor={colors.themeColor}
								underlineColorAndroid='transparent'
								placeholderTextColor={colors.textColor}
								placeholder={'Enter Comment'}
								autoCapitalize='none'
								keyboardType='email-address'
								returnKeyType={'next'}
								onChangeText={comment => this.setState({ comment })}
								value={this.state.comment}
							/>
							<View style={styles.inputLine} />
						</View>

						<TouchableOpacity
							style={{
								marginTop: 60,
								height: 47,
								justifyContent: 'center',
								alignItems: 'center',
								backgroundColor: colors.themeColor
							}}
							onPress={this.ratingSubmit}
						>
							<Text style={{ color: colors.white }}>Submit</Text>
						</TouchableOpacity>
					</View>
				</View>
			</SafeAreaView>
		);
	}
}

export default RatingScreen;

const styles = ScaledSheet.create({
	textInputStyle: {
		// lineHeight: '19@vs',
		fontSize: '16@ms',
		color: colors.textColor,
		opacity: 0.8,
		marginTop: '5@ms',
		fontFamily: fontFamily.mediumBold,
		padding: 0,
		paddingRight: '24@ms',
		textAlign: 'left'
	},
	inputLine: {
		height: '1@ms',
		width: width - 46,
		backgroundColor: colors.black,
		opacity: 0.1,
		borderRadius: '4@ms',
		marginTop: '10@ms',
		alignSelf: 'center'
	},
	headerBackGround: {
		height: '90@ms'
	},
	editProfileText: {
		color: colors.textColor,
		fontFamily: fontFamily.bold,
		fontSize: '20@ms',
		lineHeight: '24@ms',
		fontWeight: fontWeight.bold,
		textAlign: 'center'
	},
	containerBorder: {
		borderTopLeftRadius: moderateScale(30),
		borderTopRightRadius: moderateScale(30),
		borderWidth: 1,
		borderColor: colors.borderColor,
		backgroundColor: 'white',
		flex: 1
	},
	editProfileInfo: {
		textAlign: 'center',
		color: colors.smallText,
		fontSize: '13@ms',
		fontFamily: fontFamily.regular,
		lineHeight: '24@ms',
		marginTop: '5@ms'
	}
});
