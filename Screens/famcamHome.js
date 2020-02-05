import React, { Component } from 'react';
import { Platform, Text, TextInput, View, Image, Dimensions, FlatList, TouchableOpacity, Alert, ScrollView, Animated, AsyncStorage, RefreshControl, PermissionsAndroid, Keyboard } from 'react-native';
import NetInfo from "@react-native-community/netinfo";
import I18n from 'react-native-i18n';
import Icon from 'react-native-vector-icons/EvilIcons';
import { Navigation } from 'react-native-navigation';
// import { MKTextField } from 'react-native-material-kit';
import axios from 'axios';
import Spinner from 'react-native-spinkit';
import Spinner1 from 'react-native-loading-spinner-overlay';
import LinearGradient from 'react-native-linear-gradient';
// import OneSignal from 'react-native-onesignal';
import RNFetchBlob from 'react-native-fetch-blob';
import SplashScreen from "react-native-splash-screen";
import { ScaledSheet } from "react-native-size-matters";
//import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import FastImage from 'react-native-fast-image';
import { verticalScale, moderateScale, scale } from 'react-native-size-matters';
import { strings } from '../locales/i18n';
import Appurl from './../config';
import colors  from '../theme/colors';
import fontFamily from '../theme/fontFamily';
import fontWeight from '../theme/fontWeight';
import * as userActions from '../src/actions/userActions'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { setTimeout } from 'core-js';

class famcamHome extends Component {
  static navigatorStyle = {
    navBarHidden: true
  }
  constructor(props) {
    super(props);
    this.state = {
      comedian: false,
      artists: false,
      refreshing: false,
      result: [],
      recordsLength : 0,
      featured: [],
      reactionVideos: [],
      CameoVideos: [],
      res: [],
      all: [],
      arr: [false],
      disabled: true,
      categoryName: strings('globalValues.FeaturedLabel'),
      isSearch: false,
      searchText: '',
      searchData: [],
      showReaction: false,
      showCameo: false,
      visible: false,
      normalVisible: false
    }
    AsyncStorage.getItem('lang')
      .then((lang) => {
        if (lang == null) {
          if (I18n.currentLocale() == 'ar') {
            this.asqw('ar');
            I18n.locale = 'ar';
            I18n.currentLocale();
          }
          else {
            this.asqw('en');
            I18n.locale = 'en';
            I18n.currentLocale();
          }
        }
        else {
          let getlang = JSON.parse(lang);
          if (getlang == 'ar') {
            this.asqw('ar');
            I18n.locale = 'ar';
            I18n.currentLocale();
          }
          else {
            this.asqw('en');
            I18n.locale = 'en';
            I18n.currentLocale();
          }
        }
      })
  }
  asqw = async (getwq) => {
    await AsyncStorage.setItem('lang', JSON.stringify(getwq));
    this.props.actions.setLanguage(getwq)
  }
  componentWillMount() {
    this.onOpened = this.onOpened.bind(this);
    this.onReceived = this.onReceived.bind(this);
    
    try {
      let {actions} = this.props;
      let {arr} = this.state;
      AsyncStorage.getItem('user')
      .then((user) => {
        this.setState({visible: true})
          let details = JSON.parse(user);
          console.log(details)
          actions.getLoginUserId(details);
          this.firstLoad(details.userId)
      });
    }
    catch(error) {
      this.loggedout()
    }
  }
  loggedout = () => {
    return Alert.alert(
      '',
      strings('globalValues.loggedout'),
      [
        {
          text: strings('globalValues.AlertOKBtn'),
          onPress: async () => {
            this.setState({ isDisabled: false, visible: false });
            try {
              OneSignal.deleteTag("phone");
              this.props.actions.clearOnLogout()
              await AsyncStorage.removeItem('user')
              Navigation.push(this.props.componentId, {
                component: {
                  name: 'home',
                  options: {
                    topBar: {
                        visible: false
                    },
                     bottomTabs: { 
                      visible: false,
                    } 
                  }
                }
              });
            }
            catch (error) { }
          }
        }
      ],
      { cancelable: false }
    );
  }
  componentDidMount() {
    // setTimeout(() => {
    //   SplashScreen.hide();
    // }, 3000);
   
    NetInfo.getConnectionInfo().then((connectionInfo) => {
      if (connectionInfo.type == 'none' || connectionInfo.type == 'unknown') {
        this.props.actions.checkInternet(false);
      }
      else {
        this.props.actions.checkInternet(true);
      }
    });
    NetInfo.isConnected.addEventListener('connectionChange', this._handleConnectionChange);
    this.setState({ showReaction: true, showCameo: true })
    if (Platform.OS == 'android') {
      this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow);
      this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide);
    }

    setTimeout(() => {
      if (!this.props.user.netStatus) {
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
      }
      else {
        try {
          let { actions } = this.props;
          let { arr } = this.state;
          AsyncStorage.getItem('user')
            .then((user) => {
              this.setState({ visible: true })
              let details = JSON.parse(user);
              console.log(details)
              actions.getLoginUserId(details);
              this.firstLoad(details.userId)
            });
        }
        catch (error) {
          this.loggedout()
        }
      }
    }, 200);
  }
  componentWillUnmount() {
    NetInfo.isConnected.removeEventListener('connectionChange', this._handleConnectionChange);
    // OneSignal.removeEventListener('received', this.onReceived);
    // OneSignal.removeEventListener('opened', this.onOpened);
    // OneSignal.removeEventListener('registered', this.onRegistered);
    // OneSignal.removeEventListener('ids', this.onIds);
    if (Platform.OS == 'android') {
      this.keyboardDidShowListener.remove();
      this.keyboardDidHideListener.remove();
    }
  }

  _handleConnectionChange = (isConnected) => {
    this.props.actions.checkInternet(isConnected);
  }
  _keyboardDidShow = async () => {
    // const isVisible = await this.props.navigator.screenIsCurrentlyVisible()
    // if (isVisible) {
    //   this.props.navigator.toggleTabs({
    //     to: 'hidden',
    //     animated: false
    //   });
    // }
  }
  _keyboardDidHide = async () => {
    // const isVisible = await this.props.navigator.screenIsCurrentlyVisible()
    // if (isVisible) {
    //   this.props.navigator.toggleTabs({
    //     to: 'shown',
    //     animated: false
    //   });
    // }
  }
  onReceived(notification) {
    this.notificationRefresh()
    console.log("Notification received: ", notification);
  }
  onOpened(openResult) {
    this.notificationRefresh()
    console.log(openResult)
  //  console.log('Message: ', openResult.notification.payload.body);
   // console.log('Data: ', openResult.notification.payload.additionalData);
   // console.log('isActive: ', openResult.notification.isAppInFocus);
   // console.log('openResult: ', openResult);
    if (openResult.notification.payload.additionalData) {
      if (openResult.notification.payload.additionalData.orderCompleted == 'true') {
        this.props.actions.setIsOrderRecieved(1)
        this.changeTabOrder()
      }
      else if (openResult.notification.payload.additionalData.orderRejected == 'true') {
        this.props.actions.setIsOrderRecieved(0)
        this.changeTabOrder()
      }
    }
  }
  onRegistered(notifData) {
    console.log("Device had been registered for push notifications!", notifData);
  }
  onIds(device) {
    console.log(device)
  }
  changeTabOrder = () => {
    this.props.navigator.switchToTab({
      tabIndex: 1
    });
  }
  firstLoad = async (userid) => {
    let values = { 'userId': userid }
    console.log(values, 'values')
    await axios.post(`${Appurl.apiUrl}getBlockUnBlockStatus`, values)
      .then((response) => {
      //  console.log(response)
        if (response.data.userStatus) {
          return this.loggedout()
        }
      }).catch((error) => {
        console.log(error.response);
      })
    await axios.get(`${Appurl.apiUrl}showProfessionsToUserDashboard`)
      .then((response) => {
      //  console.log(response)
        this.setState({ result: [] })
        this.showCategories(response);
        this.state.arr[0] = true;
      }).catch((error) => {
        console.log(error.response);
      })
    await axios.get(`${Appurl.apiUrl}displayAllTalentToUserAccount`)
      .then((response) => {
      //  console.log(response)
        this.setState({ all: response.data.data });
      }).catch((error) => {
        console.log(error);
      })
    await axios.get(`${Appurl.apiUrl}displayFeacheredTalent`)
      .then((response) => {
        console.log(response, 'talents')
        this.setState({ featured: response.data.data });
        this.getRender(response.data.data||[]);
      }).catch((error) => {
        console.log(error);
      })
    await axios.post(`${Appurl.apiUrl}panelVideo`, values)
      .then((response) => {
      //  console.log(response)
        this.setState({ reactionVideos: response.data.data });
      }).catch((error) => {
        console.log(error);
      })
    await axios.post(`${Appurl.apiUrl}panelVideoCameio`, values)
      .then((response) => {
      //  console.log(response)
        this.setState({ CameoVideos: response.data.data });
      }).catch((error) => {
        console.log(error);
      })
    setTimeout(()=> {
      this.setState({ visible: false })
    }, 1000)
    this.clicked(strings('globalValues.FeaturedLabel'), 0)
  }
  _onRefresh() {
    this.getData();
    this.clicked(strings('globalValues.FeaturedLabel'), 0)
  }
  notificationRefresh = () => {
    this.getData();
    this.clicked(strings('globalValues.FeaturedLabel'), 0)
  }
  getData = async () => {
    if (!this.props.user.netStatus) {
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
    }
    else {
      let { result } = this.state;
      this.setState({ refreshing: true });
      let values = { 'userId': this.props.user.loginFieldId.id }
      await axios.post(`${Appurl.apiUrl}getBlockUnBlockStatus`, values)
        .then((response) => {
          if (response.data.userStatus) {
            return this.loggedout()
          }
        }).catch((error) => {
          console.log(error.response);
        })
      await axios.get(`${Appurl.apiUrl}showProfessionsToUserDashboard`)
        .then((response) => {
          console.log(response)
          this.setState({ result: [] })
          this.showCategories(response);
        }).catch((error) => {
          console.log(error.response);
        })
      await axios.get(`${Appurl.apiUrl}displayAllTalentToUserAccount`)
        .then((response) => {
          console.log('talentsgdghsdhsgdhghdghsd', response);
          this.setState({ all: response.data.data });
        }).catch((error) => {
          console.log(error);
        })
      await axios.get(`${Appurl.apiUrl}displayFeacheredTalent`)
        .then((response) => {
          console.log(response, 'reregssggsgsggsgsgsgsg');
          this.setState({ featured: response.data.data });
          this.getRender(response.data.data||[]);
        }).catch((error) => {
          console.log(error);
        })
      await axios.post(`${Appurl.apiUrl}panelVideo`, values)
        .then((response) => {
          console.log(response);
          this.setState({ reactionVideos: response.data.data });
        }).catch((error) => {
          console.log(error);
        })
      await axios.post(`${Appurl.apiUrl}panelVideoCameio`, values)
        .then((response) => {
          console.log(response);
          this.setState({ CameoVideos: response.data.data });
        }).catch((error) => {
          console.log(error);
        })
        setTimeout(()=> {
          this.setState({ refreshing: false });
        }, 1000)
    }
  }
  showCategories = (response) => {
    let { result } = this.state;
    result.push({ 'category': strings('globalValues.FeaturedLabel') });
    response.data&&response.data.professions&&response.data.professions.forEach((item, index) => {
      result.push({ 'category': this.props.user.lang == 'en' ? item.professionCatagory.en : item.professionCatagory.ar });
    });
    this.setState({ result });
  }
  clicked = (name, index) => {
   console.log(index, 'index');
   console.log(name,'hte name');
  //  return;
    let { all } = this.state;
    let { arr, res, disabled } = this.state;
    arr = [false];
    this.setState({ arr });
    if (index > -1) {
      arr[index] = true;
      this.setState({ arr });
      this.setState({ recordsLength : 0});
    }
    this.showDetailsOfTalent(name);
  }
  getRenderFeatured = () => {
    let { all, res, featured } = this.state;
    // console.log('length', featured.length, 'featureddddddd');
    this.setState({ recordsLength : featured?featured.length:0});
    res.splice(0, res.length||[]);
    this.setState({ res });
    featured&&featured.length>0&&featured.forEach((item, index) => {
      res.push({ id: item._id, name: item.name, profession: item.professions, pic: item.profilePicUrl, price: item.price });
    })
    this.setState({ showReaction: true, showCameo: true })
    this.setState({ res });
  }
  showDetailsOfTalent = (name) => {
    console.log('state', this.state)
    let { all, res } = this.state;
    res.splice(0, res.length)
  //  console.log(res.length, 'len')
    this.setState({ res });
    if (name === strings('globalValues.FeaturedLabel')) {
      this.setState({ categoryName: strings('globalValues.FeaturedLabel') });
      this.setState({ showReaction: true, showCameo: true })
      return this.getRenderFeatured();
    }
    else {
      this.setState({ categoryName: name });
      this.setState({ showReaction: false, showCameo: false })
      if(all&&all.length !== undefined)
      {
        console.log(all);
        // return;
      for (var i = 0; i < all.length; i++) {
        if (all[i].professions[1]) {
          if(all[i].professions[0]){
            if ((this.props.user.lang == 'en' ? all[i].professions[0].professionCatagory.en : all[i].professions[0].professionCatagory.ar) == name || (this.props.user.lang == 'en' ? all[i].professions[1].professionCatagory.en : all[i].professions[1].professionCatagory.ar) == name) {
              console.log(all[i], all.length)
              this.getRespectiveRender(all[i]);
            }
          }
        }
        
        else {
          if(all[i].professions[0]){
          if ((this.props.user.lang == 'en' ? all[i].professions[0].professionCatagory.en : all[i].professions[0].professionCatagory.ar) == name) {
            console.log(all[i])
            this.getRespectiveRender(all[i]);
          }
        }
        }
      }
    }
    }
  }
  getRender = (response) => {
    let { all, res } = this.state;
    console.log('getremdeer', response)
   // res.splice(0, res.length);
    this.setState({ res });
    response&&response.forEach((item, index) => {
      res.push({ id: item._id, name: item.name, profession: item.professions, pic: item.profilePicUrl, price : item.price });
    })
    this.setState({ res });
  }
  getRespectiveRender = (response) => {
    let { res } = this.state;
    res.push({ id: response._id, name: response.name, profession: response.professions, pic: response.profilePicUrl, price : response.price  });
    this.setState({ recordsLength : res.length});
    console.log(res.length, 'new length')
    this.setState({ res });
  }
  talents = (obj, talentId, related1, related2, name) => {
    console.log("hhshshhshss", obj, "price", obj.price)
 //   console.log(obj.profession[0].professionCatagory.en, 'valuesof object')
    this.props.actions.toggleButton3(true);
    let { actions } = this.props;
    actions.getTalentId(talentId);
   actions.getPrice(obj.price);
    actions.getTalentProfession(related1, related2, obj.profession[0].professionCatagory.en);
    actions.setTalentName(name);
    setTimeout(() => {
      this.props.navigation.navigate("talents");
    }, 1000)
  }
  search = (bool) => {
    this.setState({ isSearch: bool, searchText: '' });
  }
  searchTextFunc = (val) => {
    let { res } = this.state;
    this.setState({ searchText: val });
    let x = res.filter((item) => {
      return item.name.toLowerCase().match(val.toLowerCase());
    })
    this.setState({ searchData: x })
  }
  renderActualData = (value, index) => {
   console.log("actualvaluedfsffffdfdf", value)
    let { isDisabled3, textAlign, lang } = this.props.user;
    let { refreshing } = this.state;
    const Width = Dimensions.get('window').width 
    const Width2 = Dimensions.get('window').width
    return <View key={index} style={{ marginTop: moderateScale(10), marginBottom: moderateScale(10), marginborderRadius: moderateScale(6), marginHorizontal:moderateScale(10) }}>
      <TouchableOpacity style={{ flex: 1 }} disabled={isDisabled3 || refreshing} activeOpacity={0.9} onPress={() => { this.talents(value, value.id, value.profession[0]._id, value.profession[1] ? value.profession[1]._id : null, value.name) }}>
          <FastImage source={{ uri:  value.pic  }} style={{ width:scale(150), height: 200, opacity: 0.75,
borderTopLeftRadius: 10,
borderTopRightRadius: 10}} />
        <View style={{ flex: 0.9, alignItems: lang == 'en' ? 'flex-start' : 'flex-end', justifyContent: 'flex-end', marginHorizontal: 16, position: 'absolute', top: 0, bottom: 16, left: 0, right: 0, backgroundColor: 'transparent' }}>
        </View>
      </TouchableOpacity>
      {/* <Text style={{ color: 'black', textAlign: textAlign, fontSize: 18 }}>{value.name}</Text> */}
      <View style={styles.boxContainer}>
      <Text style={styles.professionFont}>{lang == 'en' ? value.profession[0].professionCatagory.en : value.profession[0].professionCatagory.ar} {value.profession[1] ? (this.props.user.lang == 'en' ? ' / ' + value.profession[1].professionCatagory.en : ' / ' + value.profession[1].professionCatagory.ar) : null}</Text>
       <Text style={styles.nameFont}>{value.name}</Text> 
       <Text style={styles.currencyStyle}>$ {value.price}</Text>
       </View> 
    </View>
  }
  renderSearchedData = (value, index) => {
    console.log("searchdata", value)
    let { isDisabled3, textAlign, lang } = this.props.user;
    let { refreshing } = this.state;
    const Width = Dimensions.get('window').width * 0.9
    return <View key={index} style={{ marginTop: moderateScale(10), marginBottom: moderateScale(10), marginborderRadius: moderateScale(6), marginHorizontal:moderateScale(10) }}>
    <TouchableOpacity style={{ flex: 1 }} disabled={isDisabled3 || refreshing} activeOpacity={0.9} onPress={() => { this.talents(value, value.id, value.profession[0]._id, value.profession[1] ? value.profession[1]._id : null, value.name) }}>
        <FastImage source={{ uri:  value.pic  }} style={{ width:scale(320), height: 200, opacity: 0.75,
borderTopLeftRadius: 10,
borderTopRightRadius: 10}} />
      <View style={{ flex: 0.9, alignItems: lang == 'en' ? 'flex-start' : 'flex-end', justifyContent: 'flex-end', marginHorizontal: 16, position: 'absolute', top: 0, bottom: 16, left: 0, right: 0, backgroundColor: 'transparent' }}>
      </View>
    </TouchableOpacity>
    {/* <Text style={{ color: 'black', textAlign: textAlign, fontSize: 18 }}>{value.name}</Text> */}
    <View style={styles.boxContainer}>
    <Text style={styles.professionFont}>{lang == 'en' ? value.profession[0].professionCatagory.en : value.profession[0].professionCatagory.ar} {value.profession[1] ? (this.props.user.lang == 'en' ? ' / ' + value.profession[1].professionCatagory.en : ' / ' + value.profession[1].professionCatagory.ar) : null}</Text>
     <Text style={styles.nameFont}>{value.name}</Text> 
     <Text style={styles.currencyStyle}>$ {value.price}</Text>
     </View> 
  </View>
  }
  // renderAllData = (field) => {
  //   let { res, searchData } = this.state;
  //   let { lang } = this.props.user;
  //   if (field == '') {
  //     return res.map((value, index) => { return this.renderActualData(value, index) });
  //   }
  //   else if (searchData.length == 0) {
  //     return <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginTop: 20 }}><Text style={{ fontSize: 20, fontFamily: lang == 'en' ? 'SFUIDisplay-Medium' : 'HelveticaNeueLTArabic-Roman' }}>{strings('famcamHome.NoDataText')}</Text></View>
  //   }
  //   else {
  //     return searchData.map((value, index) => { return this.renderSearchedData(value, index) })
  //   }
  // }

  renderAllData = (field) => {
  // console.log('dhdhdhdhhdhdhdhdhdh', 'state', field)
    let { res, searchData } = this.state;
    let { lang } = this.props.user;
    if (field == '') {
    return   <FlatList 
  data={res}
  // ItemSeparatorComponent={this.FlatListItemSeparator}
  renderItem={({item, index}) => this.renderActualData(item, index)}
  keyExtractor={item => item.id.toString()}
  numColumns={field == ''  ? 2 : 1}
  extraData={this.state}
/>
      // return res.map((value, index) => { return this.renderActualData(value, index) });
    }
    else if (searchData.length == 0) {
      console.log('0 length')
      return <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginTop: 20 }}><Text style={{ fontSize: 20, fontFamily: lang == 'en' ? 'SFUIDisplay-Medium' : 'HelveticaNeueLTArabic-Roman' }}>{strings('famcamHome.NoDataText')}</Text></View>
    }
    else {
      return searchData.map((value, index) => { return this.renderSearchedData(value, index) })
    }
  }
  forceRefresh = () => {
    if (this.props.user.forceRefresh) {
      this.props.actions.forceRefreshHome(false)
      this.getData();
      this.clicked(strings('globalValues.FeaturedLabel'), 0)
    }

  }
  playVideo = async (filePath, fileName) => {
   
    console.log(filePath,fileName,  'path')
    if (Platform.OS == 'android' && Platform.Version > 22) {
      const granted = await PermissionsAndroid.requestMultiple(
        [
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
        ]
      )
      if (granted['android.permission.WRITE_EXTERNAL_STORAGE'] != 'granted') {
        return Alert.alert(
          '',
          strings('globalValues.VideoSave'),
          [
            {
              text: strings('globalValues.AlertOKBtn'),
              onPress: () => {
                this.setState({ isDisabled: false, visible: false, normalVisible: false });
              }
            }
          ],
          { cancelable: false }
        );
      }
    }
    this.setState({ isDisabled: true, normalVisible: true })
    this.props.actions.toggleButton3(true);
    let dirs;
    if (Platform.OS == 'ios') {
      dirs = RNFetchBlob.fs.dirs.DocumentDir;
    }
    else {
      dirs = RNFetchBlob.fs.dirs.MovieDir;
    }
    let famcamDir = dirs + '/FamCamUser';
    RNFetchBlob.fs.isDir(famcamDir)
      .then((isDir) => {
        if (!isDir) {
          RNFetchBlob.fs.mkdir(famcamDir)
            .then(() => {
              RNFetchBlob
                .config({
                  path: famcamDir + '/' + fileName
                })
                .fetch('GET', filePath, {})
                .then((res) => {
                  let playpath = res.path();
                  this.props.actions.setPlayVideo(playpath)
                  this.setState({ isDisabled: false, visible: false, normalVisible: false })
                  if (Platform.OS == 'ios') {
                    setTimeout(() => {
                      this.props.navigation.navigate("video");
                    }, 1000)
                  }
                  else {
                    setTimeout(() => {
                      this.props.navigation.navigate("video");
                    }, 1000)
                  }
                })
            })
        }
        else {
          RNFetchBlob.fs.exists(famcamDir + '/' + fileName)
            .then((exist) => {
              if (!exist) {
                RNFetchBlob
                  .config({
                    // response data will be saved to this path if it has access right.
                    path: famcamDir + '/' + fileName
                  })
                  .fetch('GET', filePath, {
                    //some headers ..
                  })
                  .then((res) => {
                    console.log(res)
                    // the path should be dirs.DocumentDir + 'path-to-file.anything'
                    console.log('The file saved to ', res.path())
                    let playpath = res.path();
                    this.props.actions.setPlayVideo(playpath)
                    this.setState({ isDisabled: false, visible: false, normalVisible: false })
                    if (Platform.OS == 'ios') {
                      setTimeout(() => {
                        this.props.navigation.navigate('video2')

                      }, 1000)
                    }
                    else {
                      setTimeout(() => {
                        this.props.navigation.navigate("video2");
                      }, 1000)
                    }
                  })
              }
              else {
                let playpath = famcamDir + '/' + fileName;
                this.props.actions.setPlayVideo(playpath)
                this.setState({ isDisabled: false, visible: false, normalVisible: false })
                if (Platform.OS == 'ios') {
                  setTimeout(() => {
                    this.props.navigation.navigate("video2");
                  }, 1000)
                }
                else {
                  setTimeout(() => {
                    this.props.navigation.navigate("video2");
                  }, 1000)
                }
              }
            })
            .catch((err) => {
              this.props.actions.toggleButton3(false);
              console.log(err)
            })
        }
      })
      .catch((err) => {
        this.props.actions.toggleButton3(false);
        console.log(err)
      })
  }
  render() {
    let { normalVisible, featured, comedian, artists, result, arr, res, categoryName, all, isSearch, reactionVideos, showReaction, visible, showCameo, CameoVideos, refreshing, searchText, recordsLength } = this.state;
    let { flexDirection, textAlign, lang, isDisabled3 } = this.props.user;
  //  console.log(reactionVideos, 'shshhsh')
    return (
      <View style={{ flex: 1, backgroundColor : colors.themeHeader}}>
        <Spinner1 visible={normalVisible} color={colors.themeColor} tintColor={colors.themeColor} animation={'fade'} cancelable={false} textStyle={{ color: '#FFF' }} />
        <View style={{ height: 130 }}>
       
            <View style={{ marginTop: 30, height: 50, flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ flex: 1, flexDirection: 'row' }}>
                <View style={{ flex: 0.1 }}></View>
                <View style={{ flex: 0.8, justifyContent: 'center',alignItems : 'center' }}>
                <Image style={{tintColor:colors.themeColor}} source={require('./../Images/homelogo.png')} />
                </View>
                <View style={{ flex: 0.1, justifyContent: 'center' }}>
                  <TouchableOpacity onPress={() => { this.search(true) }}>
                    {/* <Image source={require('./../Images/ic_search.png')} style={{ width: 22, height: 22, marginTop: 12 }} /> */}
                  </TouchableOpacity>
                </View>
              </View>
              {this.forceRefresh()}
            </View>
            <View style={{ height: 50, marginEnd: 25 }}>
              <ScrollView
                style={{ flex: 1 }}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                style={{ flex: 1, flexDirection: 'row' }}>
                {result ? result.map((value, index) => {
                  return <View key={index} style={{ justifyContent: 'center', alignItems: 'center', marginLeft: 4 }}>
                    <TouchableOpacity disabled={(this.state.refreshing) || (arr[index] ? true : false)} hitSlop={{ top: 5, left: 5, bottom: 5, right: 5 }} onPress={() => { this.clicked(value.category, index) }} style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: arr[index] ? colors.themeColor : 'transparent', width: 80, height: arr[index] ? 32 : null, borderRadius: arr[index] ? 100 : null }}>
                      <Text style={{ color: arr[index] ?  colors.white : colors.black, fontSize: lang == 'en' ? 14 : 16, flexWrap: 'wrap', textAlign: 'center', fontFamily: lang == 'en' ? 'SFUIText-Bold' : 'HelveticaNeueLTArabic-Bold', backgroundColor: 'transparent' }}>{value.category}</Text>
                    </TouchableOpacity>
                  </View>
                }) : null
                }
              </ScrollView>
            </View>
           
        </View>
        <View style={{ flex:1, backgroundColor : colors.white,  borderWidth : 1,
  borderTopLeftRadius: moderateScale(20),
 borderTopRightRadius: moderateScale(20),
 borderColor : colors.border }}>
          {visible ? <View style={{ flex: 1, alignItems: 'center' }}><Spinner isVisible={visible} size={100} type="ThreeBounce" color={colors.themeColor}/></View> :
            <ScrollView
              style={{ flex: 1 }}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={this._onRefresh.bind(this)}
                  colors={[colors.themeColor, colors.themeColor, colors.themeColor]}
                />
              }
            >
              <View style={styles.searchBorder}>
             { !isSearch ? <View style={styles.textImageContainer }>
            <Text>{recordsLength} {strings('famcamHome.talentfeatures')}</Text>
                <TouchableOpacity   onPress={() => { this.search(true) }}>
                <Image  source={require('./../Images/search.png')} style={styles.searchIcon} /> 
                </TouchableOpacity>
              </View>
  :     <View style={styles.textImageContainer }>
  <View style={{ flex: 0.8, marginTop:moderateScale(-10)}}>
    <TextInput
      placeholder={strings('famcamHome.SearchLabel')}
      placeholderTextColor='#AAAFB9'
      underlineColorAndroid='transparent'
      style={{  }}
      autoFocus={true}
      onChangeText={(searchText) => { this.searchTextFunc(searchText) }}
    />
  </View>
  <View style={{ flex: 0.2, justifyContent: 'center', alignItems: 'center',marginTop:moderateScale(-10) }}>
    <TouchableOpacity style={{ flex: 0.75, justifyContent: 'center', backgroundColor: 'transparent' }} hitSlop={{ top: 7, right: 7, bottom: 7, left: 7 }} onPress={() => { this.search(false) }}>
      <Icon name="close" size={22}  style={{ width: 22 }} />
    </TouchableOpacity>
  </View>
</View>}
</View>
              {this.renderAllData(searchText)}
              {showCameo ? (CameoVideos.length ? <View style={{ flex: 0.2 }}>
                <Text style={{ fontSize: 22, color: '#4A4A4A', margin: 20, textAlign: textAlign, fontFamily: lang == 'en' ? 'SFUIDisplay-Bold' : 'HelveticaNeueLTArabic-Bold' }}>{strings('famcamHome.CameoLabel')}</Text>
                <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
                  {CameoVideos.length ? CameoVideos.map((value, index) => {
                    return <View key={index} style={{ flex: 1, marginHorizontal: 20 }}>
                      <View style={{ width: 144, height: 232 }}>
                        <TouchableOpacity disabled={isDisabled3 || refreshing} activeOpacity={0.8} onPress={() => { this.playVideo(value.videoUrlOriginal, value.videoName) }}>
                          <LinearGradient colors={['black', 'black']} style={{ width: 144, height: 192, borderRadius: 4 }}>
                            <FastImage source={{ uri: `${Appurl.apiUrl}resizeimage?imageUrl=` + value.videoUrlThumbnail + '&width=288&height=384' }} style={{ width: 144, height: 192, borderRadius: 4, opacity: 0.75 }} />
                          </LinearGradient>
                          <Image source={require('./../Images/GroupCopy3x.png')} style={{ width: 24, height: 24, position: 'absolute', top: 160, left: 5 }} />
                          <Text style={{ backgroundColor: 'transparent', fontSize: 12, color: 'white', position: 'absolute', top: 10, left: 100, fontFamily: 'SFUIDisplay-Bold' }}>{value.vedioDuration}</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  }) : null
                  }
                </ScrollView>
              </View> : null) : null}
              {showReaction &&false? (reactionVideos.length ? <View style={{ flex: 0.2 }}>
                <Text style={{ fontSize: 22, color: '#4A4A4A', margin: 20, textAlign: this.props.user.lang == 'en' ? 'left' : 'right', fontFamily: lang == 'en' ? 'SFUIDisplay-Bold' : 'HelveticaNeueLTArabic-Bold' }}>{strings('famcamHome.ReactionLabel')}</Text>
                <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
                  {reactionVideos.length ? reactionVideos.map((value, index) => {
                    return <View key={index} style={{ flex: 1, marginHorizontal: 20 }}>
                      <View style={{ width: 144, height: 232 }}>
                        <TouchableOpacity disabled={isDisabled3 || refreshing} activeOpacity={0.8} onPress={() => { this.playVideo(value.videoUrlOriginal, value.videoName) }}>
                          <LinearGradient colors={['black', 'black']} style={{ width: 144, height: 192, borderRadius: 4 }}>
                            <FastImage source={{ uri: `${Appurl.apiUrl}resizeimage?imageUrl=` + value.videoUrlThumbnail + '&width=288&height=384' }} style={{ width: 144, height: 192, borderRadius: 4, opacity: 0.75 }} />
                          </LinearGradient>
                          <Image source={require('./../Images/GroupCopy3x.png')} style={{ width: 24, height: 24, position: 'absolute', top: 160, left: 5 }} />
                          <Text style={{ backgroundColor: 'transparent', fontSize: 12, color: 'white', position: 'absolute', top: 10, left: 100, fontFamily: 'SFUIDisplay-Bold' }}>{value.vedioDuration}</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  }) : null
                  }
                </ScrollView>
              </View> : null) : null}
            </ScrollView>}
        </View>
      </View>
    )
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

export default connect(mapStateToProps, mapDispatchToProps)(famcamHome);
const styles=ScaledSheet.create({
  searchBorder :{
    borderWidth :1,
    width : "90%",
    alignSelf:"center",
    marginTop : moderateScale(10),
    borderColor :"#bdc3c7",
    height : moderateScale(50)
  },
boxContainer : {
  width:"100%",
  borderWidth : '1@ms',
  borderBottomLeftRadius: '10@ms',
 borderBottomRightRadius: '10@ms',
 borderColor : colors.border
},
currencyStyle : {
  color: colors.greenBold,
   textAlign: 'center', 
   fontSize:  '16@ms',
   fontFamily : fontFamily.bold,
   fontWeight : fontWeight.bold,
   lineHeight : '24@ms'
},
nameFont : {
  color: colors.black, 
  textAlign: 'center',
   fontSize: '15@ms',
   fontWeight : fontWeight.bold,
   lineHeight : '24@ms',
   fontFamily : fontFamily.bold
},
professionFont : {
  color: colors.professionText,
   textAlign: 'center', 
   fontFamily: fontFamily.regular, 
   fontSize: '12@ms',
   lineHeight : '24@ms'
},
textImageContainer : {
  flexDirection : 'row',
   marginHorizontal: '14@ms',
   marginTop:'15@ms'
},
searchIcon : {
  width: '22@s', // = scale(100)
  height: '22@vs',
  marginLeft : '120@ms',
  tintColor:colors.themeColor
}
})