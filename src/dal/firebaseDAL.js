// Firebase Data Access Layer (TEMPORARY - for demo only)
const { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy,
  Timestamp 
} = require('firebase/firestore');
const { db } = require('../config/firebase');

// Helper to convert Firestore timestamp to JS Date
const convertTimestamp = (timestamp) => {
  return timestamp?.toDate ? timestamp.toDate() : timestamp;
};

// Helper to convert Firestore document to object
const docToObject = (docSnapshot) => {
  if (!docSnapshot.exists()) return null;
  const data = docSnapshot.data();
  return {
    id: docSnapshot.id,
    ...data,
    created_at: convertTimestamp(data.created_at),
    updated_at: convertTimestamp(data.updated_at)
  };
};

// USERS
const usersDAL = {
  async create(userData) {
    const docRef = await addDoc(collection(db, 'users'), {
      ...userData,
      created_at: Timestamp.now(),
      updated_at: Timestamp.now()
    });
    return docRef.id;
  },

  async findById(id) {
    const docSnap = await getDoc(doc(db, 'users', id));
    return docToObject(docSnap);
  },

  async findByEmail(email) {
    const q = query(collection(db, 'users'), where('email', '==', email));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return null;
    return docToObject(querySnapshot.docs[0]);
  },

  async findByClinicId(clinicId) {
    const q = query(collection(db, 'users'), where('clinic_id', '==', clinicId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(docToObject);
  },

  async findByRole(role) {
    const q = query(collection(db, 'users'), where('role', '==', role));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(docToObject);
  },

  async update(id, updates) {
    const docRef = doc(db, 'users', id);
    await updateDoc(docRef, {
      ...updates,
      updated_at: Timestamp.now()
    });
  },

  async delete(id) {
    await deleteDoc(doc(db, 'users', id));
  }
};

// CLINICS
const clinicsDAL = {
  async create(clinicData) {
    const docRef = await addDoc(collection(db, 'clinics'), {
      ...clinicData,
      created_at: Timestamp.now(),
      updated_at: Timestamp.now()
    });
    return docRef.id;
  },

  async findById(id) {
    const docSnap = await getDoc(doc(db, 'clinics', id));
    return docToObject(docSnap);
  },

  async findAll() {
    const querySnapshot = await getDocs(collection(db, 'clinics'));
    return querySnapshot.docs.map(docToObject);
  },

  async update(id, updates) {
    const docRef = doc(db, 'clinics', id);
    await updateDoc(docRef, {
      ...updates,
      updated_at: Timestamp.now()
    });
  }
};

// PATIENTS
const patientsDAL = {
  async create(patientData) {
    const docRef = await addDoc(collection(db, 'patients'), {
      ...patientData,
      created_at: Timestamp.now(),
      updated_at: Timestamp.now()
    });
    return docRef.id;
  },

  async findById(id) {
    const docSnap = await getDoc(doc(db, 'patients', id));
    return docToObject(docSnap);
  },

  async findAll(clinicId) {
    const q = query(collection(db, 'patients'), where('clinic_id', '==', clinicId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(docToObject);
  },

  async update(id, updates) {
    const docRef = doc(db, 'patients', id);
    await updateDoc(docRef, {
      ...updates,
      updated_at: Timestamp.now()
    });
  },

  async delete(id) {
    await deleteDoc(doc(db, 'patients', id));
  }
};

// SESSIONS
const sessionsDAL = {
  async create(sessionData) {
    const docRef = await addDoc(collection(db, 'sessions'), {
      ...sessionData,
      start_time: Timestamp.fromDate(new Date(sessionData.start_time)),
      created_at: Timestamp.now(),
      updated_at: Timestamp.now()
    });
    return docRef.id;
  },

  async findById(id) {
    const docSnap = await getDoc(doc(db, 'sessions', id));
    const session = docToObject(docSnap);
    if (session && session.start_time) {
      session.start_time = convertTimestamp(session.start_time);
    }
    return session;
  },

  async findAll(clinicId, filters = {}) {
    let q = query(collection(db, 'sessions'), where('clinic_id', '==', clinicId));
    
    if (filters.therapist_id) {
      q = query(q, where('therapist_id', '==', filters.therapist_id));
    }
    if (filters.patient_id) {
      q = query(q, where('patient_id', '==', filters.patient_id));
    }
    if (filters.status) {
      q = query(q, where('status', '==', filters.status));
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const session = docToObject(doc);
      if (session.start_time) {
        session.start_time = convertTimestamp(session.start_time);
      }
      return session;
    });
  },

  async findByParentId(parentId) {
    const q = query(
      collection(db, 'sessions'), 
      where('parent_session_id', '==', parentId),
      orderBy('series_order', 'asc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const session = docToObject(doc);
      if (session.start_time) {
        session.start_time = convertTimestamp(session.start_time);
      }
      return session;
    });
  },

  async update(id, updates) {
    const docRef = doc(db, 'sessions', id);
    const updateData = { ...updates, updated_at: Timestamp.now() };
    
    if (updates.start_time) {
      updateData.start_time = Timestamp.fromDate(new Date(updates.start_time));
    }
    
    await updateDoc(docRef, updateData);
  },

  async delete(id) {
    await deleteDoc(doc(db, 'sessions', id));
  }
};

module.exports = {
  usersDAL,
  clinicsDAL,
  patientsDAL,
  sessionsDAL
};

