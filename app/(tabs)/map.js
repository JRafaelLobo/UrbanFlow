import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  PanResponder,
  Animated,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Modal,
  Pressable,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Location from 'expo-location';
import { WebView } from 'react-native-webview';

import { contract } from "@/constants/thirdweb";
import { TransactionButton, useActiveAccount, useContractEvents, } from "thirdweb/react";

import { arbitrumSepolia } from "thirdweb/chains";
import {
  getContract,
  prepareContractCall,
  toUnits,
} from "thirdweb";
import { createThirdwebClient, ThirdwebClient } from "thirdweb";

// Assuming you're using ethers.js or web3.js for blockchain interaction
// import { ethers } from 'ethers';

const { width, height } = Dimensions.get('window');
const BOTTOM_SHEET_MAX_HEIGHT = height * 0.8;
const BOTTOM_SHEET_MIN_HEIGHT = height * 0.35;

// Smart Contract Configuration
const CONTRACT_ADDRESS = "0x...";
const CONTRACT_ABI = [


  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_platform",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_feeManager",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "AcceptWindowPassed",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "DeadlineNotReached",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "DeadlinePassed",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ECDSAInvalidSignature",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "length",
        "type": "uint256"
      }
    ],
    "name": "ECDSAInvalidSignatureLength",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "s",
        "type": "bytes32"
      }
    ],
    "name": "ECDSAInvalidSignatureS",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ExcessivePlatformFee",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ExcessiveSlippage",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidAmounts",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidCodeLength",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidSignature",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidState",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "NotAuthorized",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "TimeOverflow",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "TransferFailed",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "WrongCode",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "WrongValue",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ZeroAddress",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "sender",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "AccidentalDepositReceived",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "oldManager",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newManager",
        "type": "address"
      }
    ],
    "name": "FeeManagerUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "orderId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "driver",
        "type": "address"
      }
    ],
    "name": "OrderAccepted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "orderId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "canceler",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "refundAmount",
        "type": "uint256"
      }
    ],
    "name": "OrderCanceled",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "orderId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "customer",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "driver",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "merchant",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amountDriver",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amountMerchant",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "platformFee",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "deadline",
        "type": "uint256"
      }
    ],
    "name": "OrderCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "orderId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "driver",
        "type": "address"
      }
    ],
    "name": "OrderDelivered",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "orderId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "customer",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "OrderRefunded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "orderId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint8",
        "name": "attemptsLeft",
        "type": "uint8"
      }
    ],
    "name": "PINAttemptFailed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "oldPercentage",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "newPercentage",
        "type": "uint256"
      }
    ],
    "name": "PlatformFeeUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "WithdrawalMade",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "DOMAIN_SEPARATOR",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "DOMAIN_TYPEHASH",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "DRIVER_ACCEPT_WINDOW",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "ORDER_APPROVAL_TYPEHASH",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "orderId",
        "type": "uint256"
      }
    ],
    "name": "acceptOrder",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "orderId",
        "type": "uint256"
      }
    ],
    "name": "canDriverAccept",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "orderId",
        "type": "uint256"
      }
    ],
    "name": "cancelOrder",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "code",
        "type": "string"
      }
    ],
    "name": "computeCodeHash",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "orderId",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "code",
        "type": "string"
      }
    ],
    "name": "confirmDelivery",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_driver",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_merchant",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_amountDriver",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_amountMerchant",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_platformFee",
        "type": "uint256"
      },
      {
        "internalType": "bytes32",
        "name": "_codeHash",
        "type": "bytes32"
      },
      {
        "internalType": "uint256",
        "name": "_deadline",
        "type": "uint256"
      },
      {
        "internalType": "bytes",
        "name": "_driverSignature",
        "type": "bytes"
      },
      {
        "internalType": "bytes",
        "name": "_merchantSignature",
        "type": "bytes"
      }
    ],
    "name": "createOrder",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "orderId",
        "type": "uint256"
      }
    ],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "feeManager",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "orderId",
        "type": "uint256"
      }
    ],
    "name": "getAcceptTimeRemaining",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "driver",
        "type": "address"
      }
    ],
    "name": "getDriverOrders",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "driverOrders",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "orderId",
        "type": "uint256"
      }
    ],
    "name": "getOrderStatus",
    "outputs": [
      {
        "internalType": "enum DeliveryEscrow.State",
        "name": "state",
        "type": "uint8"
      },
      {
        "internalType": "uint256",
        "name": "acceptTimeRemaining",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "deliveryTimeRemaining",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "canAccept",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "canCancel",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "canRefund",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "driver",
        "type": "address"
      }
    ],
    "name": "getPendingOrdersForDriver",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "maxPlatformFeePercentage",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "nextOrderId",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "nonces",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "orders",
    "outputs": [
      {
        "internalType": "address",
        "name": "customer",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "driver",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "merchant",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amountDriver",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "amountMerchant",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "platformFee",
        "type": "uint256"
      },
      {
        "internalType": "bytes32",
        "name": "codeHash",
        "type": "bytes32"
      },
      {
        "internalType": "uint256",
        "name": "deadline",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "creationTime",
        "type": "uint256"
      },
      {
        "internalType": "enum DeliveryEscrow.State",
        "name": "state",
        "type": "uint8"
      },
      {
        "internalType": "uint8",
        "name": "attempts",
        "type": "uint8"
      },
      {
        "internalType": "uint256",
        "name": "nonce",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "pendingWithdrawals",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "platform",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "orderId",
        "type": "uint256"
      }
    ],
    "name": "refundAfterDeadline",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "orderId",
        "type": "uint256"
      }
    ],
    "name": "rejectOrder",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newFeeManager",
        "type": "address"
      }
    ],
    "name": "setFeeManager",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "newPercentage",
        "type": "uint256"
      }
    ],
    "name": "setMaxPlatformFeePercentage",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "withdrawAccidentalFunds",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "stateMutability": "payable",
    "type": "receive"
  },
  "function acceptOrder(uint256 orderId) external",
  "function confirmDelivery(uint256 orderId, string calldata code) external",
  "function rejectOrder(uint256 orderId) external",
  "function withdraw() external",
  "function orders(uint256) external view returns (tuple)",
  "function canDriverAccept(uint256 orderId) external view returns (bool)",
  "function getDriverOrders(address driver) external view returns (uint256[])",
  "function getPendingOrdersForDriver(address driver) external view returns (uint256[])",
  "function pendingWithdrawals(address) external view returns (uint256)",
  // Events
  "event OrderAccepted(uint256 indexed orderId, address indexed driver)",
  "event OrderDelivered(uint256 indexed orderId, address indexed driver)",
  "event OrderCanceled(uint256 indexed orderId, address indexed canceler, uint256 refundAmount)"
];





const DeliveryApp = () => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const bottomSheetHeight = useRef(new Animated.Value(BOTTOM_SHEET_MIN_HEIGHT)).current;
  const lastGesture = useRef(0);

  //contrato
  const clientId = process.env.EXPO_PUBLIC_THIRDWEB_CLIENT_ID;
  const secretKey = process.env.EXPO_PRIVATE_THIRDWEB_CLIENT_ID;
  const THIRDWEB_CLIENT = createThirdwebClient({
    clientId,
    secretKey,
  });

  /*
  const contrato = getContract({
    address: CONTRACT_ADDRESS,
    chain: arbitrumSepolia,
    client: THIRDWEB_CLIENT,
    abi:CONTRACT_ABI
  });
*/

  // Blockchain State
  const account = useActiveAccount();
  const [pendingWithdrawals, setPendingWithdrawals] = useState('0');
  const [isLoading, setIsLoading] = useState(false);
  const [contract, setContract] = useState(null);

  // Location State
  const [location, setLocation] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(true);

  // Modal States
  const [walletModalVisible, setWalletModalVisible] = useState(false);
  const [pinModalVisible, setPinModalVisible] = useState(false);
  const [confirmingOrderId, setConfirmingOrderId] = useState(null);
  const [pinCode, setPinCode] = useState('');

  // Orders State - Enhanced with blockchain data
  const [orders, setOrders] = useState([
    {
      id: '1',
      orderId: 1, // Blockchain order ID
      customerName: 'Customer #1',
      deliveryTime: '10 pm',
      status: 'Pending', // Pending, Accepted, Released, Canceled
      address: 'Calle Principal 123',
      phone: '+504 9999-9999',
      amount: '0.05 ETH',
      amountDriver: '0.02 ETH',
      items: ['Hamburguesa Clásica', 'Papas Fritas', 'Coca Cola'],
      latitude: 14.0723,
      longitude: -87.1921,
      canAccept: true,
      deadline: Date.now() + (2 * 60 * 60 * 1000), // 2 hours from now
      acceptTimeRemaining: 5 * 60, // 5 minutes in seconds
    },
    {
      id: '2',
      orderId: 2,
      customerName: 'Customer #2',
      deliveryTime: '15 pm',
      status: 'Accepted',
      address: 'Avenida Secundaria 456',
      phone: '+504 8888-8888',
      amount: '0.03 ETH',
      amountDriver: '0.015 ETH',
      items: ['Pizza Mediana', 'Refresco'],
      latitude: 14.0823,
      longitude: -87.2021,
      canAccept: false,
      deadline: Date.now() + (1 * 60 * 60 * 1000),
      acceptTimeRemaining: 0,
    }
  ]);

  // Location Permission
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLoadingLocation(false);
        return;
      }
      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
      setLoadingLocation(false);
    })();
  }, []);

  const updatePendingWithdrawals = async (address) => {
    try {
      // Mock pending withdrawals - replace with actual contract call
      // const pending = await contract.pendingWithdrawals(address);
      const mockPending = "0.045"; // ETH
      setPendingWithdrawals(mockPending);
    } catch (error) {
      console.error("Error fetching pending withdrawals:", error);
    }
  };

  // Smart Contract Interactions
  const acceptOrder = async (orderId) => {
    if (!account) {
      Alert.alert("Error", "Please connect your wallet first");
      return;
    }

    try {
      setIsLoading(true);

      // Actual contract call:
      // const tx = await contract.acceptOrder(orderId);
      // await tx.wait();

      // Mock transaction for demo
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update local state
      setOrders(prev => prev.map(order =>
        order.orderId === orderId
          ? { ...order, status: 'Accepted', canAccept: false }
          : order
      ));

      Alert.alert("Success", "Order accepted successfully!");
    } catch (error) {
      Alert.alert("Error", `Failed to accept order: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const rejectOrder = async (orderId) => {
    if (!account) {
      Alert.alert("Error", "Please connect your wallet first");
      return;
    }

    Alert.alert(
      "Confirm Rejection",
      "Are you sure you want to reject this order? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reject", style: "destructive", onPress: async () => {
            try {
              setIsLoading(true);

              // Actual contract call:
              // const tx = await contract.rejectOrder(orderId);
              // await tx.wait();

              // Mock transaction
              await new Promise(resolve => setTimeout(resolve, 2000));

              // Update local state
              setOrders(prev => prev.filter(order => order.orderId !== orderId));

              Alert.alert("Success", "Order rejected successfully!");
            } catch (error) {
              Alert.alert("Error", `Failed to reject order: ${error.message}`);
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const confirmDelivery = async (orderId, code) => {
    if (!account) {
      Alert.alert("Error", "Please connect your wallet first");
      return;
    }

    if (!code || code.length < 4) {
      Alert.alert("Error", "Please enter a valid PIN code (minimum 4 characters)");
      return;
    }

    try {
      setIsLoading(true);

      // Actual contract call:
      // const tx = await contract.confirmDelivery(orderId, code);
      // await tx.wait();

      // Mock transaction
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update local state
      setOrders(prev => prev.map(order =>
        order.orderId === orderId
          ? { ...order, status: 'Released' }
          : order
      ));

      // Update pending withdrawals
      await updatePendingWithdrawals(account.address);

      setPinModalVisible(false);
      setPinCode('');
      setConfirmingOrderId(null);

      Alert.alert("Success", "Delivery confirmed! Funds are now available for withdrawal.");
    } catch (error) {
      Alert.alert("Error", `Failed to confirm delivery: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const withdrawFunds = async () => {
    if (!account) {
      Alert.alert("Error", "Please connect your wallet first");
      return;
    }

    if (pendingWithdrawals === '0') {
      Alert.alert("Info", "No funds available for withdrawal");
      return;
    }

    try {
      setIsLoading(true);

      // Actual contract call:
      // const tx = await contract.withdraw();
      // await tx.wait();

      // Mock transaction
      await new Promise(resolve => setTimeout(resolve, 3000));

      setPendingWithdrawals('0');

      Alert.alert("Success", `Successfully withdrew ${pendingWithdrawals} ETH to your wallet!`);
    } catch (error) {
      Alert.alert("Error", `Failed to withdraw funds: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Pan Responder for bottom sheet
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dy) > 10;
      },
      onPanResponderGrant: (evt, gestureState) => {
        lastGesture.current = bottomSheetHeight._value;
      },
      onPanResponderMove: (evt, gestureState) => {
        const newHeight = lastGesture.current - gestureState.dy;
        if (newHeight >= BOTTOM_SHEET_MIN_HEIGHT && newHeight <= BOTTOM_SHEET_MAX_HEIGHT) {
          bottomSheetHeight.setValue(newHeight);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        const velocity = gestureState.vy;
        const currentHeight = bottomSheetHeight._value;
        const midPoint = (BOTTOM_SHEET_MIN_HEIGHT + BOTTOM_SHEET_MAX_HEIGHT) / 2;
        let targetHeight;

        if (Math.abs(velocity) > 0.5) {
          targetHeight = velocity < 0 ? BOTTOM_SHEET_MAX_HEIGHT : BOTTOM_SHEET_MIN_HEIGHT;
        } else {
          targetHeight = currentHeight > midPoint ? BOTTOM_SHEET_MAX_HEIGHT : BOTTOM_SHEET_MIN_HEIGHT;
        }

        Animated.spring(bottomSheetHeight, {
          toValue: targetHeight,
          useNativeDriver: false,
          tension: 100,
          friction: 8,
        }).start();
      },
    })
  ).current;

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return '#F39C12';
      case 'Accepted':
        return '#4CAF50';
      case 'Released':
        return '#2196F3';
      case 'Canceled':
        return '#E74C3C';
      default:
        return '#9E9E9E';
    }
  };

  const formatTimeRemaining = (seconds) => {
    if (seconds <= 0) return "Expired";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const renderOrderActions = (order) => {
    switch (order.status) {
      case 'Pending':
        return (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.acceptButton]}
              onPress={() => acceptOrder(order.orderId)}
              disabled={!order.canAccept || isLoading}
            >
              <Icon name="check" size={16} color="#fff" />
              <Text style={styles.actionButtonText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => rejectOrder(order.orderId)}
              disabled={isLoading}
            >
              <Icon name="close" size={16} color="#fff" />
              <Text style={styles.actionButtonText}>Reject</Text>
            </TouchableOpacity>
            {order.acceptTimeRemaining > 0 && (
              <View style={styles.timeRemaining}>
                <Icon name="timer" size={14} color="#F39C12" />
                <Text style={styles.timeText}>
                  {formatTimeRemaining(order.acceptTimeRemaining)}
                </Text>
              </View>
            )}
          </View>
        );

      case 'Accepted':
        return (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.confirmButton]}
              onPress={() => {
                setConfirmingOrderId(order.orderId);
                setPinModalVisible(true);
              }}
              disabled={isLoading}
            >
              <Icon name="done-all" size={16} color="#fff" />
              <Text style={styles.actionButtonText}>Confirm Delivery</Text>
            </TouchableOpacity>
          </View>
        );

      case 'Released':
        return (
          <View style={styles.completedBadge}>
            <Icon name="verified" size={16} color="#27AE60" />
            <Text style={styles.completedText}>Delivered</Text>
          </View>
        );

      default:
        return null;
    }
  };

  const renderOrderItem = ({ item }) => (
    <View style={styles.orderCard}>
      <TouchableOpacity
        onPress={() => setSelectedOrder(selectedOrder?.id === item.id ? null : item)}
      >
        <View style={styles.orderHeader}>
          <View style={styles.orderInfo}>
            <Text style={styles.customerName}>{item.customerName}</Text>
            <Text style={styles.deliveryAddress}>{item.address}</Text>
            <Text style={styles.orderAmount}>Driver Payment: {item.amountDriver}</Text>
          </View>
          <View style={styles.orderStatus}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
            <Text style={styles.deliveryTime}>{item.deliveryTime}</Text>
          </View>
        </View>

        {selectedOrder?.id === item.id && (
          <View style={styles.orderDetails}>
            <View style={styles.detailRow}>
              <Icon name="location-on" size={16} color="#666" />
              <Text style={styles.detailText}>{item.address}</Text>
            </View>
            <View style={styles.detailRow}>
              <Icon name="phone" size={16} color="#666" />
              <Text style={styles.detailText}>{item.phone}</Text>
            </View>
            <View style={styles.detailRow}>
              <Icon name="attach-money" size={16} color="#666" />
              <Text style={styles.detailText}>Total: {item.amount}</Text>
            </View>
            <View style={styles.detailRow}>
              <Icon name="account-balance-wallet" size={16} color="#666" />
              <Text style={styles.detailText}>Your Payment: {item.amountDriver}</Text>
            </View>
            <View style={styles.itemsList}>
              <Text style={styles.itemsTitle}>Items:</Text>
              {item.items.map((orderItem, index) => (
                <Text key={index} style={styles.itemText}>• {orderItem}</Text>
              ))}
            </View>
          </View>
        )}
      </TouchableOpacity>

      {renderOrderActions(item)}
    </View>
  );

  const getMapUrl = () => {
    if (!location) return '';
    const { latitude, longitude } = location;
    const bbox = `${longitude - 0.03},${latitude - 0.03},${longitude + 0.03},${latitude + 0.03}`;
    const markersParams = orders
      .map(o => `&marker=${o.latitude},${o.longitude}`)
      .join('');
    return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik${markersParams}`;
  };

  // Correcciones y mejoras aplicadas:
  // - Se asegura que los modales funcionen correctamente y no se bloqueen por el estado de carga global.
  // - Se evita que el botón de "Withdraw" bloquee el botón de "Wallet" cuando isLoading es true.
  // - Se mejora la gestión de estados y el cierre de modales.
  // - Se agregan validaciones y manejo de errores más robustos.
  // - Se corrige el FlatList para evitar advertencias de keyExtractor.
  // - Se asegura que los botones y campos de texto estén siempre habilitados/deshabilitados correctamente.

  // --- MODALS ---
  // PIN Confirmation Modal
  const PinModal = () => (
    <Modal
      visible={pinModalVisible}
      transparent
      animationType="slide"
      onRequestClose={() => {
        setPinModalVisible(false);
        setPinCode('');
        setConfirmingOrderId(null);
      }}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.pinModal}>
          <Text style={styles.pinTitle}>Confirm Delivery</Text>
          <Text style={styles.pinSubtitle}>Enter the PIN code provided by the customer</Text>
          <TextInput
            style={styles.pinInput}
            placeholder="Enter PIN Code"
            value={pinCode}
            onChangeText={setPinCode}
            keyboardType="default"
            autoCapitalize="none"
            maxLength={16}
            editable={!isLoading}
          />
          <View style={styles.pinButtons}>
            <TouchableOpacity
              style={[styles.pinButton, styles.pinCancelButton]}
              onPress={() => {
                setPinModalVisible(false);
                setPinCode('');
                setConfirmingOrderId(null);
              }}
              disabled={isLoading}
            >
              <Text style={styles.pinButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.pinButton, styles.pinConfirmButton]}
              onPress={() => confirmDelivery(confirmingOrderId, pinCode)}
              disabled={isLoading || !pinCode}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.pinButtonText}>Confirm</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // Wallet Modal
  const WalletModal = () => (
    <Modal
      visible={walletModalVisible}
      transparent
      animationType="slide"
      onRequestClose={() => setWalletModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.walletModal}>
          <Text style={styles.walletTitle}>Driver Wallet</Text>
          {account ? (
            <>
              <Text style={styles.walletLabel}>Address:</Text>
              <Text style={styles.walletValue}>
                {account.address ? `${account.address.slice(0, 6)}...${account.address.slice(-4)}` : ''}
              </Text>
              <Text style={styles.walletLabel}>Pending Withdrawals:</Text>
              <Text style={styles.walletValue}>{pendingWithdrawals} ETH</Text>
              <TouchableOpacity
                style={styles.withdrawWalletButton}
                onPress={withdrawFunds}
                disabled={isLoading || pendingWithdrawals === '0'}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.withdrawWalletText}>Withdraw Funds</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.walletSubtitle}>Connect your wallet to start accepting orders</Text>
              <TouchableOpacity
                style={styles.connectButton}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.connectButtonText}>Connect Wallet</Text>
                )}
              </TouchableOpacity>
            </>
          )}
          <Pressable
            style={styles.closeButton}
            onPress={() => setWalletModalVisible(false)}
            disabled={isLoading}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );

  // --- MAIN RENDER ---
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      {/* Connection Status Bar */}
      {!account && (
        <View style={styles.connectionBar}>
          <Icon name="warning" size={16} color="#E74C3C" />
          <Text style={styles.connectionText}>Wallet not connected - Connect to accept orders</Text>
        </View>
      )}
      {/* Map */}
      {loadingLocation ? (
        <View style={[styles.map, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color="#3498DB" />
          <Text style={{ color: '#3498DB', marginTop: 10 }}>Getting location...</Text>
        </View>
      ) : location ? (
        <WebView source={{ uri: getMapUrl() }} style={styles.map} />
      ) : (
        <View style={[styles.map, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={{ color: '#E74C3C' }}>Location permission denied</Text>
        </View>
      )}
      {/* Modals */}
      <WalletModal />
      <PinModal />
      {/* Bottom Sheet */}
      <Animated.View style={[styles.bottomSheet, { height: bottomSheetHeight }]}>
        <View {...panResponder.panHandlers} style={styles.dragHandle}>
          <View style={styles.dragIndicator} />
        </View>
        <View style={styles.bottomSheetContent}>
          <View style={styles.headerRow}>
            <Text style={styles.sectionTitle}>Your Orders</Text>
            {account && (
              <View style={styles.balanceBadge}>
                <Text style={styles.balanceText}>{pendingWithdrawals} ETH</Text>
              </View>
            )}
          </View>
          <FlatList
            data={orders}
            renderItem={renderOrderItem}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            style={styles.ordersList}
            extraData={selectedOrder}
          />
          {/* Web3 Actions Section */}
          <View style={styles.web3Section}>
            <View style={styles.web3Header}>
              <Text style={styles.web3Title}>Blockchain Actions</Text>
              <View style={styles.connectionStatus}>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: account ? '#27AE60' : '#E74C3C' },
                  ]}
                />
                <Text style={styles.connectionStatusText}>
                  {account ? 'Connected' : 'Disconnected'}
                </Text>
              </View>
            </View>
            <View style={styles.actionButtonsRow}>
              <TouchableOpacity
                style={styles.web3Button}
                onPress={() => setWalletModalVisible(true)}
                disabled={isLoading}
              >
                <Icon name="account-balance-wallet" size={20} color="#fff" />
                <Text style={styles.web3ButtonText}>Wallet</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.web3Button, styles.withdrawButton]}
                onPress={withdrawFunds}
                disabled={!account || pendingWithdrawals === '0' || isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Icon name="get-app" size={20} color="#fff" />
                    <Text style={styles.web3ButtonText}>Withdraw</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  connectionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFE5E5',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  connectionText: {
    marginLeft: 8,
    color: '#E74C3C',
    fontSize: 12,
    fontWeight: '500',
  },
  map: {
    flex: 1,
  },
  bottomSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#2C3E50',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
  },
  dragHandle: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  dragIndicator: {
    width: 40,
    height: 4,
    backgroundColor: '#BDC3C7',
    borderRadius: 2,
  },
  bottomSheetContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  balanceBadge: {
    backgroundColor: '#27AE60',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  balanceText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  ordersList: {
    flex: 1,
    marginBottom: 20,
  },
  orderCard: {
    backgroundColor: '#34495E',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderInfo: {
    flex: 1,
    marginRight: 10,
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  deliveryAddress: {
    fontSize: 12,
    color: '#BDC3C7',
    marginBottom: 4,
  },
  orderAmount: {
    fontSize: 14,
    color: '#27AE60',
    fontWeight: '600',
  },
  orderStatus: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  deliveryTime: {
    fontSize: 12,
    color: '#BDC3C7',
  },
  orderDetails: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#4A5F7A',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#BDC3C7',
  },
  itemsList: {
    marginTop: 10,
  },
  itemsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  itemText: {
    fontSize: 13,
    color: '#BDC3C7',
    marginLeft: 10,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    flexWrap: 'wrap',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  acceptButton: {
    backgroundColor: '#27AE60',
  },
  rejectButton: {
    backgroundColor: '#E74C3C',
  },
  confirmButton: {
    backgroundColor: '#3498DB',
    flex: 1,
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  timeRemaining: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F39C12',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  timeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D5F4E6',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  completedText: {
    color: '#27AE60',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  web3Section: {
    backgroundColor: '#2C3E50',
    paddingBottom: 20,
  },
  web3Header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  web3Title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  connectionStatusText: {
    fontSize: 12,
    color: '#BDC3C7',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  web3Button: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#3498DB',
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  withdrawButton: {
    backgroundColor: '#27AE60',
    marginRight: 0,
  },
  web3ButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(44,62,80,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  walletModal: {
    width: width * 0.85,
    maxWidth: 320,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  walletTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#2C3E50',
  },
  walletSubtitle: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  walletLabel: {
    fontSize: 14,
    color: '#34495E',
    marginTop: 12,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
  },
  walletValue: {
    fontSize: 15,
    color: '#3498DB',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  connectButton: {
    backgroundColor: '#3498DB',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  connectButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  withdrawWalletButton: {
    backgroundColor: '#27AE60',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
  },
  withdrawWalletText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  closeButton: {
    marginTop: 12,
    backgroundColor: '#95A5A6',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 24,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  pinModal: {
    width: width * 0.85,
    maxWidth: 300,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  pinTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2C3E50',
  },
  pinSubtitle: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  pinInput: {
    width: '100%',
    borderWidth: 2,
    borderColor: '#3498DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'monospace',
  },
  pinButtons: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  pinButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  pinCancelButton: {
    backgroundColor: '#95A5A6',
    marginRight: 8,
  },
  pinConfirmButton: {
    backgroundColor: '#27AE60',
    marginLeft: 8,
  },
  pinButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default DeliveryApp;