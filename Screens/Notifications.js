import React, { Component } from 'react';
import { SafeAreaView, Alert, Text, View, Image, TouchableOpacity, ScrollView } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { Navigation } from 'react-native-navigation';
import axios from 'axios';
import Spinner from 'react-native-loading-spinner-overlay';
import { ScaledSheet, moderateScale, verticalScale, scale } from 'react-native-size-matters';
import Appurl from './../config';
import colors from '../theme/colors';
import fontFamily from '../theme/fontFamily';
import fontWeight from '../theme/fontWeight';
import * as userActions from '../src/actions/userActions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { strings } from '../locales/i18n';
import moment from 'moment';

class Notifications extends Component {
	static navigatorStyle = {
		navBarHidden: true,
		tabBarHidden: true
	};
	constructor(props) {
		super(props);
		this.state = {
			visible: true,
			textshow: '',
			arr: [1, 2, 3, 4],
			notifications: []
		};
		// alert("the notifications")
	}
	showNotifications = () => {
		this.setState({ visible: true });
		console.log('urlllll', `${Appurl.apiUrl}common/v1/getNotification`);
		return axios
			.get(`${Appurl.apiUrl}common/v1/getNotification`, {
				params: {
					to: this.props.user.loginFieldId.userId
				}
			})
			.then(response => {
				console.log(response, 'arraylength');
				if (response.data.data.length !== 0) {
					this.setState({ notifications: response.data.data,visible:false });
				} else {
					this.setState({ visible: false });
				}
			})
			.catch(error => {
				console.log(error, 'the eror');
				this.setState({ visible: false });
				Alert.alert(
					'',
					'An error occured',
					[
						{
							text: strings('globalValues.AlertOKBtn'),
							onPress: () => {
								this.setState({ visible: false });
							}
						}
					],
					{ cancelable: false }
				);
			});
	};

	componentDidMount() {
		NetInfo.getConnectionInfo().then(connectionInfo => {
			if (connectionInfo.type == 'none' || connectionInfo.type == 'unknown') {
				this.props.actions.checkInternet(false);
			} else {
				this.props.actions.checkInternet(true);
			}
		});
		NetInfo.isConnected.addEventListener('connectionChange', this._handleConnectionChange);

		setTimeout(() => {
			if (!this.props.user.netStatus) {
				this.setState({ visible: false });
				return Alert.alert(
					'',
					strings('globalValues.NetAlert'),
					[
						{
							text: strings('globalValues.AlertOKBtn'),
							onPress: () => {
								this.setState({ isDisabled: false, visible: false });
							}
						}
					],
					{ cancelable: false }
				);
			} else {
				this.showNotifications();
			}
		}, 200);
	}
	componentWillUnmount() {
		let { actions } = this.props;
		actions.toggleButton(false);
		NetInfo.isConnected.removeEventListener('connectionChange', this._handleConnectionChange);
	}
	_handleConnectionChange = isConnected => {
		this.props.actions.checkInternet(isConnected);
	};

	back = () => {
		this.props.navigator.pop();
	};
	getTime = (dateTime) => {
		if (!dateTime) {
			return null;
		}
	
		const today = moment();
	
		const time = moment(dateTime);
	
		const diff = today.diff(time);
	
		const duration = moment.duration(diff);
		if (duration.years() > 0) {
			return duration.years() + 'y';
		} else if (duration.weeks() > 0) {
			return duration.weeks() + 'w';
		} else if (duration.days() > 0) {
			return duration.days() + 'd';
		} else if (duration.hours() > 0) {
			return duration.hours() + 'h';
		} else if (duration.minutes() > 0) {
			return duration.minutes() + 'm';
		} else if (duration.minutes() < 1) {
			return '1s';
		}
	}
	render() {
		let { visible, textshow } = this.state;
		let { textAlign, lang } = this.props.user;
		return (
			<SafeAreaView style={{ flex: 1, backgroundColor: colors.themeHeader }}>
				<View style={{ flex: 1 }}>
					<Spinner
						visible={visible}
						color='#8D3F7D'
						tintColor='#8D3F7D'
						animation={'fade'}
						cancelable={false}
						textStyle={{ color: '#FFF' }}
					/>

					<View style={styles.headerBackGround}>
						<Text style={styles.notificationsText}> {strings('Notifications.notifications')}</Text>
					</View>
					<View style={styles.containerBorder}>
						{this.state.notifications.length !== 0 ? (
							<ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
								<Text style={styles.countText}>
									{strings('Notifications.total')} {this.state.notifications.length} {strings('Notifications.notifications')}{' '}
								</Text>
								{this.state.notifications.map((item) => (
									<View>
	<Text style={styles.contentText}>{item.title}</Text>
										<Text style={styles.secondContent}>
											{item.message.en}
										</Text>
										{/* <Text style={styles.thirdContent}>Order ID: #233242424244242</Text> */}
										<Text style={styles.timeText}>{this.getTime(item.createdDateMili)}</Text>
									</View>
								))}
							</ScrollView>
						) : (
							<Text
								style={{
									color: colors.themeColor,
									textAlign: 'center',
									fontSize: 14,
									marginTop: 20,
									fontFamily: lang == 'en' ? 'SFProDisplay-Bold' : 'HelveticaNeueLTArabic-Bold'
								}}
							>
								{!visible && strings('globalValues.NothingText')}
							</Text>
						)}
					</View>
				</View>
			</SafeAreaView>
		);
	}
}

function mapStateToProps(state, ownProps) {
	return {
		user: state.user
	};
}

function mapDispatchToProps(dispatch) {
	return {
		actions: bindActionCreators(userActions, dispatch)
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(Notifications);
const styles = ScaledSheet.create({
	registerHeading: {
		marginTop: '20@ms',
		color: colors.regHeading,
		fontSize: '20@ms',
		lineHeight: '24@ms',
		fontWeight: fontWeight.bold,
		fontFamily: fontFamily.mediumBold
	},
	notificationsText: {
		textAlign: 'center',
		fontSize: '20@ms',
		color: colors.notificationsText,
		marginTop: '20@ms',
		fontFamily: fontFamily.bold,
		fontWeight: fontWeight.bold,
		lineHeight: '24@ms'
	},
	container: {
		marginHorizontal: '24@ms'
	},
	containerBorder: {
		borderTopLeftRadius: moderateScale(30),
		borderTopRightRadius: moderateScale(30),
		borderWidth: 1,
		borderColor: colors.borderColor,
		backgroundColor: 'white',
		flex: 1
	},
	headerBackGround: {
		height: '90@ms'
	},
	countText: {
		fontFamily: fontFamily.bold,
		color: colors.notificationsText,
		marginTop: '20@ms',
		lineHeight: '24@ms',
		fontSize: '14@ms',
		fontWeight: fontWeight.bold
	},
	contentText: {
		fontFamily: fontFamily.bold,
		color: colors.themeColor,
		marginTop: '10@ms',
		lineHeight: '24@ms',
		fontSize: '14@ms',
		fontWeight: fontWeight.bold
	},
	secondContent: {
		fontFamily: fontFamily.regular,
		color: colors.black,
		marginTop: '2@ms',
		lineHeight: '18@ms',
		fontSize: '12@ms'
	},
	thirdContent: {
		fontFamily: fontFamily.regular,
		color: colors.black,
		marginTop: '2@ms',
		lineHeight: '18@ms',
		fontSize: '12@ms'
	},
	timeText: {
		alignSelf: 'flex-end'
	}
});
