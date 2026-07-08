import { useEffect, useState, useRef } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { isFirebaseSupported, db } from "../firebase";

/**
 * Reusable React hook to sync a Firestore collection with local state in real-time.
 * 
 * @param {string} collectionName - Name of the Firestore collection
 * @param {Function} [getConstraints] - Function returning an array of Firestore query constraints
 * @param {Array} [initialData=[]] - Initial state before data resolves
 * @returns {Array} List of document data objects, each containing an `id` field
 */
export function useFirestoreCollection(collectionName, getConstraints, initialData = []) {
  const [data, setData] = useState(initialData);
  const getConstraintsRef = useRef(getConstraints);
  getConstraintsRef.current = getConstraints;

  useEffect(() => {
    if (!isFirebaseSupported || !db) return;
    try {
      const colRef = collection(db, collectionName);
      const constraints = getConstraintsRef.current ? getConstraintsRef.current() : [];
      const q = constraints.length > 0 ? query(colRef, ...constraints) : colRef;
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const docs = [];
        snapshot.forEach((doc) => {
          docs.push({ id: doc.id, ...doc.data() });
        });
        if (docs.length > 0) {
          setData(docs);
        }
      });
      return unsubscribe;
    } catch (err) {
      console.error(`Error subscribing to Firestore collection "${collectionName}":`, err);
    }
  }, [collectionName]);

  return [data, setData];
}
