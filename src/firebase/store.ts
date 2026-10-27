import {
  addDoc,
  collection,
  doc,
  getFirestore,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import { products } from '../data/products';
import type { CartLine } from '../types/store';
import { firebaseApp } from './firebase';

export const firestore = firebaseApp ? getFirestore(firebaseApp) : null;

export type ShippingDetails = {
  name: string;
  address: string;
  city: string;
  postcode: string;
  email: string;
  phone: string;
};

export type OrderRequestSummary = {
  id: string;
  createdAt: Date | null;
  itemCount: number;
  status: 'inquiry';
  message: string;
  intent: 'inquiry' | 'purchase';
};

function requireFirestore() {
  if (!firestore) throw new Error('Firebase is not configured yet.');
  return firestore;
}

export async function ensureUserProfile(uid: string, email: string | null) {
  if (!email) throw new Error('This account does not have an email address.');

  const db = requireFirestore();
  const profileRef = doc(db, 'users', uid);
  const profile = await getDoc(profileRef);

  if (profile.exists()) {
    await setDoc(profileRef, { email, updatedAt: serverTimestamp() }, { merge: true });
    return;
  }

  await setDoc(profileRef, {
    email,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function getUserCart(uid: string): Promise<CartLine[]> {
  const db = requireFirestore();
  const snapshot = await getDocs(collection(db, 'users', uid, 'cart'));

  return snapshot.docs.flatMap((cartItem) => {
    const quantity = cartItem.data().quantity;
    return Number.isSafeInteger(quantity) && quantity >= 1 && quantity <= 99
      ? [{ id: cartItem.id, quantity: quantity as number }]
      : [];
  });
}

export async function saveUserCart(uid: string, cart: CartLine[]) {
  const db = requireFirestore();
  const cartCollection = collection(db, 'users', uid, 'cart');
  const existingItems = await getDocs(cartCollection);
  const quantities = new Map<string, number>();

  for (const item of cart) {
    if (!/^[a-z0-9-]+$/.test(item.id) || !Number.isSafeInteger(item.quantity) || item.quantity < 1) {
      throw new Error('The cart contains an invalid item.');
    }
    quantities.set(item.id, Math.min(99, (quantities.get(item.id) ?? 0) + item.quantity));
  }

  if (quantities.size > 50) throw new Error('A cart can contain up to 50 different items.');

  const batch = writeBatch(db);
  existingItems.docs.forEach((savedItem) => {
    if (!quantities.has(savedItem.id)) batch.delete(savedItem.ref);
  });
  quantities.forEach((quantity, id) => {
    batch.set(doc(cartCollection, id), { quantity, updatedAt: serverTimestamp() });
  });

  if (existingItems.size || quantities.size) await batch.commit();
}

export async function createOrderInquiry(
  uid: string,
  shipping: ShippingDetails,
  cart: CartLine[],
  message = '',
) {
  if (!cart.length || cart.length > 50) throw new Error('A purchase request must contain 1–50 items.');
  if (cart.some((line) => !Number.isSafeInteger(line.quantity) || line.quantity < 1 || line.quantity > 99)) throw new Error('Invalid item quantity.');

  if (message.trim().length > 4000) throw new Error('The message is too long.');
  if (cart.some((line) => !products.some((product) => product.id === line.id && product.availability === 'Available'))) throw new Error('An item is unavailable.');
  const db = requireFirestore();
  const order = await addDoc(collection(db, 'users', uid, 'orders'), {
    intent: 'purchase',
    message: message.trim(),
    contactEmail: shipping.email.trim(),
    shipping: {
      name: shipping.name.trim(),
      address: shipping.address.trim(),
      city: shipping.city.trim(),
      postcode: shipping.postcode.trim(),
      phone: shipping.phone.trim(),
    },
    items: cart.map(({ id, quantity }) => ({ productId: id, quantity })),
    status: 'inquiry',
    createdAt: serverTimestamp(),
  });

  return order.id;
}

export async function getUserOrders(uid: string): Promise<OrderRequestSummary[]> {
  const db = requireFirestore();
  const ordersQuery = query(
    collection(db, 'users', uid, 'orders'),
    orderBy('createdAt', 'desc'),
    limit(10),
  );
  const snapshot = await getDocs(ordersQuery);

  return snapshot.docs.map((orderDocument) => {
    const data = orderDocument.data();
    const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : null;
    const itemCount = Array.isArray(data.items)
      ? data.items.reduce((total: number, item: unknown) => {
          if (!item || typeof item !== 'object' || !('quantity' in item)) return total;
          const quantity = item.quantity;
          return Number.isSafeInteger(quantity) && typeof quantity === 'number'
            ? total + quantity
            : total;
        }, 0)
      : 0;

    return {
      id: orderDocument.id,
      createdAt,
      itemCount,
      status: 'inquiry',
      message: typeof data.message === 'string' ? data.message : '',
      intent: data.intent === 'purchase' ? 'purchase' : 'inquiry',
    };
  });
}

export async function createArtworkInquiry(uid: string, email: string, productId: string, message: string) {
  const trimmed = message.trim();
  if (!trimmed || trimmed.length > 4000 || !products.some((product) => product.id === productId)) {
    throw new Error('Please enter a valid artwork inquiry.');
  }
  return addDoc(collection(requireFirestore(), 'users', uid, 'inquiries'), {
    productId, contactEmail: email, message: trimmed,
    status: 'inquiry', createdAt: serverTimestamp(),
  });
}

export async function getUserInquiries(uid: string) {
  const snapshot = await getDocs(query(collection(requireFirestore(), 'users', uid, 'inquiries'), orderBy('createdAt', 'desc'), limit(10)));
  return snapshot.docs.map((item) => ({
    id: item.id,
    productId: String(item.data().productId),
    message: String(item.data().message),
  }));
}

export async function createContactInquiry(uid: string, values: {
  name: string; email: string; location: string; size: string; budget: string; message: string;
}) {
  return addDoc(collection(requireFirestore(), 'users', uid, 'contactInquiries'), {
    name: values.name.trim(), contactEmail: values.email.trim(),
    location: values.location.trim(), size: values.size.trim(), budget: values.budget.trim(),
    message: values.message.trim(), status: 'inquiry', createdAt: serverTimestamp(),
  });
}
