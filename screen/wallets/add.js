/* global alert */
import React, { Component } from 'react';
import { Alert, AsyncStorage, ActivityIndicator, Keyboard, Dimensions, View, TextInput, TouchableWithoutFeedback } from 'react-native';
import {
  BlueTextCentered,
  BlueText,
  LightningButton,
  BitcoinButton,
  BlueButtonLink,
  BlueFormLabel,
  BlueButton,
  SafeBlueArea,
  BlueCard,
  BlueFormInput,
  BlueNavigationStyle,
  BlueSpacing20,
} from '../../BlueComponents';
import { RadioGroup, RadioButton } from 'react-native-flexi-radio-button';
import PropTypes from 'prop-types';
import { HDSegwitP2SHWallet } from '../../class/hd-segwit-p2sh-wallet';
import { LightningCustodianWallet } from '../../class/lightning-custodian-wallet';
import { AppStorage, SegwitP2SHWallet } from '../../class';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
let EV = require('../../events');
let A = require('../../analytics');
/** @type {AppStorage} */
let BlueApp = require('../../BlueApp');
let loc = require('../../loc');
const { width } = Dimensions.get('window');
const advancedModeKey = 'ADVANCED_MODE';
export default class WalletsAdd extends Component {
  static navigationOptions = ({ navigation }) => ({
    ...BlueNavigationStyle(navigation, true),
    title: loc.wallets.add.title,
    headerLeft: null,
  });

  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      isAdvancedOptionsEnabled: false,
      walletBaseURI: '',
    };
  }

  async componentDidMount() {
    let isAdvancedOptionsEnabled = await AsyncStorage.getItem(advancedModeKey);
    isAdvancedOptionsEnabled = JSON.parse(isAdvancedOptionsEnabled);
    let walletBaseURI = await AsyncStorage.getItem(AppStorage.LNDHUB);
    walletBaseURI = JSON.parse(walletBaseURI) || '';
    this.setState({
      isLoading: false,
      activeBitcoin: true,
      label: '',
      isAdvancedOptionsEnabled,
      walletBaseURI,
    });
  }

  setLabel(text) {
    this.setState({
      label: text,
    }); /* also, a hack to make screen update new typed text */
  }

  onSelect(index, value) {
    this.setState({
      selectedIndex: index,
      selectedValue: value,
    });
  }

  render() {
    if (this.state.isLoading) {
      return (
        <View style={{ flex: 1, paddingTop: 20 }}>
          <ActivityIndicator />
        </View>
      );
    }

    return (
      <SafeBlueArea forceInset={{ horizontal: 'always' }} style={{ flex: 1, paddingTop: 40 }}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false} style={{ flex: 1 }}>
          <BlueCard>
            <BlueFormLabel>{loc.wallets.add.wallet_name}</BlueFormLabel>
            <View
              style={{
                flexDirection: 'row',
                borderColor: '#d2d2d2',
                borderBottomColor: '#d2d2d2',
                borderWidth: 1.0,
                borderBottomWidth: 0.5,
                backgroundColor: '#f5f5f5',
                minHeight: 44,
                height: 44,
                marginHorizontal: 20,
                alignItems: 'center',
                marginVertical: 16,
                borderRadius: 4,
              }}
            >
              <TextInput
                value={this.state.label}
                placeholderTextColor="#81868e"
                placeholder={this.state.activeBitcoin ? loc.wallets.add.label_new_segwit : loc.wallets.add.label_new_lightning}
                onChangeText={text => {
                  this.setLabel(text);
                }}
                style={{ flex: 1, marginHorizontal: 8, color: '#81868e' }}
                editable={!this.state.isLoading}
                underlineColorAndroid="transparent"
              />
            </View>
            <BlueFormLabel>{loc.wallets.add.wallet_type}</BlueFormLabel>

            <View style={{ flexDirection: 'row', paddingTop: 10, paddingLeft: 20, width: width - 80, borderColor: 'red', borderWidth: 0 }}>
              <View style={{ width: (width - 60) / 3, height: (width - 60) / 3, backgroundColor: 'transparent' }}>
                <BitcoinButton
                  active={this.state.activeBitcoin}
                  onPress={() => {
                    Keyboard.dismiss()
                    this.setState({
                      activeBitcoin: true,
                      activeLightning: false,
                    });
                  }}
                  style={{
                    width: (width - 60) / 3,
                    height: (width - 60) / 3,
                  }}
                  title={loc.wallets.add.create}
                />
              </View>
              <View style={{ top: 40, width: (width - 185) / 3, height: 50, borderColor: 'red', borderWidth: 0 }}>
                <BlueTextCentered style={{ textAlign: 'center' }}>{loc.wallets.add.or}</BlueTextCentered>
              </View>
              <View style={{ width: (width - 60) / 3, height: (width - 60) / 3, position: 'absolute', top: 10, right: 0 }}>
                <LightningButton
                  active={this.state.activeLightning}
                  onPress={() => {
                    Keyboard.dismiss()
                    this.setState({
                      activeBitcoin: false,
                      activeLightning: true,
                    });
                  }}
                  style={{
                    width: (width - 60) / 3,
                    height: (width - 60) / 3,
                  }}
                  title={loc.wallets.add.create}
                />
              </View>
            </View>

            <View>
              {(() => {
                if (this.state.activeBitcoin && this.state.isAdvancedOptionsEnabled) {
                  return (
                    <View
                      style={{
                        width: 200,
                        height: 100,
                        left: 10,
                      }}
                    >
                      <RadioGroup onSelect={(index, value) => this.onSelect(index, value)} selectedIndex={0}>
                        <RadioButton value={HDSegwitP2SHWallet.type}>
                          <BlueText>{HDSegwitP2SHWallet.typeReadable}</BlueText>
                        </RadioButton>
                        <RadioButton value={SegwitP2SHWallet.type}>
                          <BlueText>{SegwitP2SHWallet.typeReadable}</BlueText>
                        </RadioButton>
                      </RadioGroup>
                    </View>
                  );
                } else if (this.state.activeLightning && this.state.isAdvancedOptionsEnabled) {
                  return (
                    <View style={{ marginVertical: 40, marginHorizontal: 20, borderWidth: 0 }}>
                      <BlueText>connect to</BlueText>
                      <BlueFormInput
                        value={this.state.walletBaseURI}
                        onChangeText={text => {
                          this.setState({ walletBaseURI: text });
                        }}
                        onSubmitEditing={Keyboard.dismiss}
                        placeholder={'BlueWallet LNDHub'}
                        clearButtonMode="while-editing"
                        autoCapitalize="none"
                      />
                    </View>
                  );
                } else {
                  return (
                    <View>
                      <BlueSpacing20 />
                    </View>
                  );
                }
              })()}
            </View>

            <View
              style={{
                alignItems: 'center',
                flex: 1,
              }}
            >
              {!this.state.isLoading ? (
                <BlueButton
                  title={loc.wallets.add.create}
                  onPress={() => {
                    this.setState(
                      { isLoading: true },
                      async () => {
                        let w;

                        if (this.state.activeLightning) {
                          // eslint-disable-next-line

                          this.createLightningWallet = async () => {
                            w = new LightningCustodianWallet();
                            w.setLabel(this.state.label || w.typeReadable);

                            try {
                              let lndhub =
                                this.state.walletBaseURI.trim().length > 0
                                  ? this.state.walletBaseURI
                                  : LightningCustodianWallet.defaultBaseUri;
                              if (lndhub) {
                                const isValidNodeAddress = await LightningCustodianWallet.isValidNodeAddress(lndhub);
                                if (isValidNodeAddress) {
                                  w.setBaseURI(lndhub);
                                  w.init();
                                } else {
                                  throw new Error('The provided node address is not valid LNDHub node.');
                                }
                              }
                              await w.createAccount();
                              await w.authorize();
                            } catch (Err) {
                              this.setState({ isLoading: false });
                              console.warn('lnd create failure', Err);
                              return alert(Err);
                              // giving app, not adding anything
                            }
                            A(A.ENUM.CREATED_LIGHTNING_WALLET);
                            await w.generate();
                            BlueApp.wallets.push(w);
                            await BlueApp.saveToDisk();
                            EV(EV.enum.WALLETS_COUNT_CHANGED);
                            A(A.ENUM.CREATED_WALLET);
                            ReactNativeHapticFeedback.trigger('notificationSuccess', false);
                            this.props.navigation.dismiss();
                          };

                          if (!BlueApp.getWallets().some(wallet => wallet.type !== LightningCustodianWallet.type)) {
                            Alert.alert(
                              loc.wallets.add.lightning,
                              loc.wallets.createBitcoinWallet,
                              [
                                {
                                  text: loc.send.details.cancel,
                                  style: 'cancel',
                                  onPress: () => {
                                    this.setState({ isLoading: false });
                                  },
                                },
                                {
                                  text: loc._.ok,
                                  style: 'default',
                                  onPress: () => {
                                    this.createLightningWallet();
                                  },
                                },
                              ],
                              { cancelable: false },
                            );
                          } else {
                            this.createLightningWallet();
                          }
                        } else if (this.state.selectedIndex === 1) {
                          // btc was selected
                          // index 1 radio - segwit single address
                          w = new SegwitP2SHWallet();
                          w.setLabel(this.state.label || loc.wallets.add.label_new_segwit);
                        } else {
                          // zero index radio - HD segwit
                          w = new HDSegwitP2SHWallet();
                          w.setLabel((this.state.label || loc.wallets.add.label_new_segwit) + ' HD');
                        }
                        if (this.state.activeBitcoin) {
                          await w.generate();
                          BlueApp.wallets.push(w);
                          await BlueApp.saveToDisk();
                          EV(EV.enum.WALLETS_COUNT_CHANGED);
                          A(A.ENUM.CREATED_WALLET);
                          ReactNativeHapticFeedback.trigger('notificationSuccess', false);
                          this.props.navigation.dismiss();
                        }
                      },
                      1,
                    );
                  }}
                />
              ) : (
                <ActivityIndicator />
              )}

              <BlueButtonLink
                title={loc.wallets.add.import_wallet}
                onPress={() => {
                  this.props.navigation.navigate('ImportWallet');
                }}
              />
            </View>
          </BlueCard>
        </TouchableWithoutFeedback>
      </SafeBlueArea>
    );
  }
}

WalletsAdd.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
    goBack: PropTypes.func,
    dismiss: PropTypes.func,
  }),
};
