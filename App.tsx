import React, { useEffect, useState } from 'react';
import {
  EmitterSubscription,
  FlatList,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  endConnection,
  initConnection,
  getProducts,
  Product,
  requestPurchase,
  purchaseUpdatedListener,
  InAppPurchase,
  finishTransaction,
} from 'react-native-iap';

const productsIds = Platform.select({
  ios: [],
  android: [
    'android.test.purchased',
    'android.test.item_unavailable',
    'android.test.canceled',
    'android.test.refunded',
  ],
});

let purchaseUpdateSubscription: EmitterSubscription | null = null;

const App = () => {
  const [products, setProducts] = useState<Product[]>();

  async function loadProducts() {
    const storeProducts = await getProducts(productsIds!);

    setProducts(storeProducts);
  }

  useEffect(() => {
    async function initIap() {
      await initConnection();

      loadProducts();

      purchaseUpdateSubscription = purchaseUpdatedListener(
        async (purchase: InAppPurchase) => {
          const receipt = purchase.transactionReceipt;

          if (receipt) {
            await finishTransaction(purchase);
          }
        },
      );

      return () => {
        if (purchaseUpdateSubscription) {
          purchaseUpdateSubscription.remove();
          purchaseUpdateSubscription = null;
        }

        endConnection();
      };
    }

    initIap();
  }, []);

  async function buyProduct(productId: string) {
    try {
      await requestPurchase(productId);
    } catch (error) {
      // error
    }
  }

  return (
    <View>
      <FlatList
        data={products}
        renderItem={({ item }) => (
          <View>
            <Text style={{ fontSize: 18 }}>{item.title}</Text>
            <Text style={{ fontSize: 18 }}>{item.description}</Text>
            <Text style={{ fontSize: 18 }}>{item.currency}</Text>
            <Text style={{ fontSize: 18 }}>{item.localizedPrice}</Text>
            <TouchableOpacity onPress={() => buyProduct(item.productId)}>
              <Text
                style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>
                Comprar
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

export default App;
