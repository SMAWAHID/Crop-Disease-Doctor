import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import pickle
import os

class VectorDB:
    def __init__(self, persist_path=None):
        self.vectors = []
        self.metadata = []
        self.persist_path = persist_path
        
        # Auto-load if path exists
        if persist_path and os.path.exists(persist_path):
            self.load(persist_path)
        
    def add(self, vector, meta):
        """
        Add a vector and its metadata to the store.
        vector: numpy array of shape (embedding_dim,)
        meta: dict containing metadata (e.g., {'text': '...', 'id': '...'})
        """
        self.vectors.append(vector)
        self.metadata.append(meta)

    def search(self, query_vector, top_k=5):
        """
        Search for the top_k most similar vectors.
        """
        if not self.vectors:
            return []
            
        # Stack vectors to create a matrix
        vector_matrix = np.vstack(self.vectors)
        
        # Reshape query if needed
        if query_vector.ndim == 1:
            query_vector = query_vector.reshape(1, -1)
            
        # Calculate cosine similarity
        similarities = cosine_similarity(query_vector, vector_matrix)[0]
        
        # Get top_k indices
        top_indices = np.argsort(similarities)[::-1][:top_k]
        
        results = []
        for idx in top_indices:
            results.append({
                'score': float(similarities[idx]),
                'metadata': self.metadata[idx]
            })
            
        return results

    def __len__(self):
        return len(self.vectors)

    def save(self, path=None):
        """
        Save the vector database to disk using pickle.
        """
        save_path = path or self.persist_path
        if not save_path:
            raise ValueError("No persist_path specified for saving")
        
        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(save_path), exist_ok=True)
        
        data = {
            'vectors': self.vectors,
            'metadata': self.metadata
        }
        
        with open(save_path, 'wb') as f:
            pickle.dump(data, f)
        print(f"VectorDB saved to {save_path}")
    
    def load(self, path=None):
        """
        Load the vector database from disk.
        """
        load_path = path or self.persist_path
        if not load_path:
            raise ValueError("No persist_path specified for loading")
        
        with open(load_path, 'rb') as f:
            data = pickle.load(f)
        
        self.vectors = data['vectors']
        self.metadata = data['metadata']
        print(f"VectorDB loaded from {load_path} ({len(self)} entries)")

