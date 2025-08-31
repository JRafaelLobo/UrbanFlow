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
  TextInput,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Location from 'expo-location';
import { WebView } from 'react-native-webview';

const { width, height } = Dimensions.get('window');
const BOTTOM_SHEET_MAX_HEIGHT = height * 0.7;
const BOTTOM_SHEET_MIN_HEIGHT = height * 0.3;

const DeliveryApp = () => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showPinModal, setShowPinModal] = useState(false);
  const [deliveryPin, setDeliveryPin] = useState('');
  const [currentOrderForDelivery, setCurrentOrderForDelivery] = useState(null);
  const bottomSheetHeight = useRef(new Animated.Value(BOTTOM_SHEET_MIN_HEIGHT)).current;
  const lastGesture = useRef(0);

  // Estado para la ubicación
  const [location, setLocation] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(true);

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

  // Datos de ejemplo para los pedidos con información blockchain
  const [orders, setOrders] = useState([
    {
      id: '1',
      customerName: 'Unliqur ID',
      deliveryTime: '10 pm',
      status: 'Accepted',
      address: 'Calle Principal 123',
      phone: '+504 9999-9999',
      amount: '$25.50',
      items: ['Hamburguesa Clásica', 'Papas Fritas', 'Coca Cola'],
      // Información blockchain
      customerAddress: '0xCustomer...1234',
      merchantAddress: '0xMerchant...5678',
      amountDriver: '0.01 ETH',
      cancelTimeRemaining: 300, // 5 minutos en segundos
      canRejectOrder: true,
    },
    {
      id: '2',
      customerName: 'Customer Name',
      deliveryTime: '15 pm',
      status: 'Accepted',
      address: 'Avenida Secundaria 456',
      phone: '+504 8888-8888',
      amount: '$18.75',
      items: ['Pizza Mediana', 'Refresco'],
      // Información blockchain
      customerAddress: '0xCustomer...9876',
      merchantAddress: '0xMerchant...5432',
      amountDriver: '0.008 ETH',
      cancelTimeRemaining: 180, // 3 minutos en segundos
      canRejectOrder: true,
    },
    {
      id: '3',
      customerName: 'Customer Yoias',
      deliveryTime: '10 pm',
      status: 'En Route',
      address: 'Boulevard Tercero 789',
      phone: '+504 7777-7777',
      amount: '$32.20',
      items: ['Pollo Frito', 'Ensalada', 'Jugo Natural'],
      // Información blockchain
      customerAddress: '0xCustomer...1111',
      merchantAddress: '0xMerchant...2222',
      amountDriver: '0.012 ETH',
      cancelTimeRemaining: 0, // Ya no se puede cancelar
      canRejectOrder: false,
    },
    {
      id: '4',
      customerName: 'Customer You',
      deliveryTime: '20 pm',
      status: 'En Route',
      address: 'Colonia Cuarta 101',
      phone: '+504 6666-6666',
      amount: '$12.90',
      items: ['Tacos', 'Guacamole'],
      // Información blockchain
      customerAddress: '0xCustomer...3333',
      merchantAddress: '0xMerchant...4444',
      amountDriver: '0.006 ETH',
      cancelTimeRemaining: 0, // Ya no se puede cancelar
      canRejectOrder: false,
    },
  ]);

  // Hook para manejar countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setOrders(prevOrders =>
        prevOrders.map(order => ({
          ...order,
          cancelTimeRemaining: Math.max(0, order.cancelTimeRemaining - 1),
          canRejectOrder: order.cancelTimeRemaining > 1,
        }))
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Función para formatear el tiempo restante
  const formatTimeRemaining = (seconds) => {
    if (seconds <= 0) return 'Expired';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Función para rechazar pedido
  const handleRejectOrder = (order) => {
    Alert.alert(
      'Reject Order',
      `Are you sure you want to reject the order from ${order.customerName}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: () => {
            setOrders(prevOrders => prevOrders.filter(o => o.id !== order.id));
            setSelectedOrder(null);
            Alert.alert('Order Rejected', 'The order has been rejected successfully.');
          },
        },
      ]
    );
  };

  // Función para abrir modal de PIN
  const handleConfirmDelivery = (order) => {
    setCurrentOrderForDelivery(order);
    setShowPinModal(true);
    setDeliveryPin('');
  };

  // Función para confirmar entrega
  const confirmDelivery = () => {
    if (deliveryPin.length < 4) {
      Alert.alert('Invalid PIN', 'Please enter a valid delivery PIN.');
      return;
    }

    // Aquí llamarías a la función real de confirmDelivery
    Alert.alert(
      'Delivery Confirmed',
      `Delivery confirmed for ${currentOrderForDelivery.customerName}. You earned ${currentOrderForDelivery.amountDriver}!`,
      [
        {
          text: 'OK',
          onPress: () => {
            setOrders(prevOrders => prevOrders.filter(o => o.id !== currentOrderForDelivery.id));
            setSelectedOrder(null);
            setShowPinModal(false);
            setCurrentOrderForDelivery(null);
            setDeliveryPin('');
          },
        },
      ]
    );
  };

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
        } else if (newHeight < BOTTOM_SHEET_MIN_HEIGHT) {
          bottomSheetHeight.setValue(BOTTOM_SHEET_MIN_HEIGHT);
        } else if (newHeight > BOTTOM_SHEET_MAX_HEIGHT) {
          bottomSheetHeight.setValue(BOTTOM_SHEET_MAX_HEIGHT);
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
      case 'Accepted':
        return '#4CAF50';
      case 'En Route':
        return '#2196F3';
      default:
        return '#9E9E9E';
    }
  };

  const renderOrderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => setSelectedOrder(selectedOrder?.id === item.id ? null : item)}
    >
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <Text style={styles.customerName}>{item.customerName}</Text>
          <Text style={styles.deliveryAddress}>Delivery Address</Text>
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
          {/* Información tradicional */}
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
            <Text style={styles.detailText}>{item.amount}</Text>
          </View>

          {/* Información blockchain */}
          <View style={styles.blockchainSection}>
            <Text style={styles.blockchainTitle}>Blockchain Details</Text>
            
            <View style={styles.detailRow}>
              <Icon name="account-circle" size={16} color="#3498DB" />
              <Text style={styles.detailText}>Customer: {item.customerAddress}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Icon name="store" size={16} color="#3498DB" />
              <Text style={styles.detailText}>Merchant: {item.merchantAddress}</Text>
            </View>
            
            <View style={styles.earningsRow}>
              <Icon name="monetization-on" size={16} color="#27AE60" />
              <Text style={styles.earningsText}>You'll earn {item.amountDriver}</Text>
            </View>

            {/* Countdown para rechazo */}
            <View style={styles.countdownRow}>
              <Icon name="timer" size={16} color={item.cancelTimeRemaining > 0 ? "#E74C3C" : "#666"} />
              <Text style={[
                styles.countdownText,
                { color: item.cancelTimeRemaining > 0 ? "#E74C3C" : "#666" }
              ]}>
                Reject time: {formatTimeRemaining(item.cancelTimeRemaining)}
              </Text>
            </View>
          </View>

          <View style={styles.itemsList}>
            <Text style={styles.itemsTitle}>Items:</Text>
            {item.items.map((orderItem, index) => (
              <Text key={index} style={styles.itemText}>• {orderItem}</Text>
            ))}
          </View>

          {/* Botones de acción */}
          <View style={styles.actionButtons}>
            {item.canRejectOrder && (
              <TouchableOpacity
                style={styles.rejectButton}
                onPress={() => handleRejectOrder(item)}
              >
                <Icon name="close" size={18} color="#fff" />
                <Text style={styles.rejectButtonText}>Reject</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={[styles.confirmButton, { flex: item.canRejectOrder ? 1 : 2 }]}
              onPress={() => handleConfirmDelivery(item)}
            >
              <Icon name="check" size={18} color="#fff" />
              <Text style={styles.confirmButtonText}>Confirm Delivery</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );

  // Construye la URL de OpenStreetMap centrada en la ubicación actual y muestra los marcadores de ejemplo
  const getMapUrl = () => {
    if (!location) return '';
    const { latitude, longitude } = location;
    // Puedes ajustar el bbox para el zoom y centrar el mapa
    const bbox = `${longitude-0.03},${latitude-0.03},${longitude+0.03},${latitude+0.03}`;
    // Solo se puede mostrar un marcador en el embed de OSM, así que mostramos la ubicación actual
    return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${latitude},${longitude}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Mapa con OpenStreetMap usando WebView */}
      {loadingLocation ? (
        <View style={[styles.map, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color="#3498DB" />
          <Text style={{ color: '#3498DB', marginTop: 10 }}>Obteniendo ubicación...</Text>
        </View>
      ) : location ? (
        <WebView
          source={{ uri: getMapUrl() }}
          style={styles.map}
        />
      ) : (
        <View style={[styles.map, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={{ color: '#E74C3C' }}>Permiso de ubicación denegado</Text>
        </View>
      )}

      {/* Bottom Sheet Mejorado */}
      <Animated.View style={[styles.bottomSheet, { height: bottomSheetHeight }]}>
        <View {...panResponder.panHandlers} style={styles.dragHandle}>
          <View style={styles.dragIndicator} />
        </View>

        <View style={styles.bottomSheetContent}>
          <Text style={styles.sectionTitle}>Current Orders</Text>

          <FlatList
            data={orders}
            renderItem={renderOrderItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            style={styles.ordersList}
          />

          <View style={styles.paymentsSection}>
            <View style={styles.paymentsSectionHeader}>
              <Text style={styles.paymentsTitle}>Decentralized Payments</Text>
              <TouchableOpacity>
                <Icon name="settings" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.paymentButtons}>
              <TouchableOpacity style={styles.viewWalletButton}>
                <Text style={styles.viewWalletText}>View Wallet</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.withdrawButton}>
                <Text style={styles.withdrawText}>Withdraw Funds</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Animated.View>

      {/* Modal para PIN de entrega */}
      <Modal
        visible={showPinModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPinModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Confirm Delivery</Text>
            <Text style={styles.modalSubtitle}>
              Enter the delivery PIN provided by the customer.
            </Text>
            
            <TextInput
              style={styles.pinInput}
              value={deliveryPin}
              onChangeText={setDeliveryPin}
              placeholder="Enter PIN"
              placeholderTextColor="#999"
              maxLength={8}
              keyboardType="numeric"
              secureTextEntry={true}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setShowPinModal(false);
                  setDeliveryPin('');
                }}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={confirmDelivery}
              >
                <Text style={styles.modalConfirmText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
  },
  dragHandle: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
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
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  ordersList: {
    flex: 1,
    marginBottom: 20,
  },
  orderCard: {
    backgroundColor: '#34495E',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  deliveryAddress: {
    fontSize: 14,
    color: '#BDC3C7',
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
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
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
  blockchainSection: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#4A5F7A',
  },
  blockchainTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3498DB',
    marginBottom: 10,
  },
  earningsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: '#27AE60',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  earningsText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  countdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  countdownText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: 'bold',
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
    marginTop: 15,
    gap: 10,
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#E74C3C',
    borderRadius: 8,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  confirmButton: {
    backgroundColor: '#27AE60',
    borderRadius: 8,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  paymentsSection: {
    backgroundColor: '#2C3E50',
    paddingBottom: 20,
  },
  paymentsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  paymentsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  paymentButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  viewWalletButton: {
    flex: 1,
    backgroundColor: '#27AE60',
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 10,
  },
  viewWalletText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  withdrawButton: {
    flex: 1,
    backgroundColor: '#3498DB',
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: 'center',
    marginLeft: 10,
  },
  withdrawText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Estilos del modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    width: width * 0.85,
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 10,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 25,
  },
  pinInput: {
    borderWidth: 2,
    borderColor: '#3498DB',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 25,
    letterSpacing: 2,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: '#E74C3C',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalConfirmButton: {
    flex: 1,
    backgroundColor: '#27AE60',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalConfirmText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DeliveryApp;