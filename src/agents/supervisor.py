# Supervisor Agent orchestrates multiple tools (Vision, Weather, Search)
from src.agents.tools import predict_disease
from src.rag.embeddings import EmbeddingModel
from src.memory.vectordb import VectorDB
import os

class SupervisorAgent:
    def __init__(self, vectordb_path=None):
        # Could store past interactions in memory module later
        self.history = []
        
        # Set default path relative to project root
        if vectordb_path is None:
            _current_dir = os.path.dirname(os.path.abspath(__file__))
            _project_root = os.path.abspath(os.path.join(_current_dir, "..", ".."))
            vectordb_path = os.path.join(_project_root, "data", "knowledge_base.pkl")
        
        # Initialize RAG components
        self.embedder = EmbeddingModel()
        self.vectordb = VectorDB(persist_path=vectordb_path)
        
        # If DB is empty, initialize with basic knowledge
        if len(self.vectordb) == 0:
            self._initialize_knowledge_base()

    def _initialize_knowledge_base(self):
        """
        Initialize the knowledge base with basic crop disease information.
        """
        knowledge_entries = [
            {"id": "K001", "text": "Tomato Early Blight is caused by the fungus Alternaria solani. Symptoms include dark brown spots with concentric rings on older leaves. Treatment: Remove infected leaves, apply copper-based fungicides, ensure proper spacing for air circulation."},
            {"id": "K002", "text": "Tomato Late Blight is caused by Phytophthora infestans. Symptoms include water-soaked lesions on leaves and stems, white mold on undersides. Treatment: Apply fungicides immediately, remove infected plants, avoid overhead watering."},
            {"id": "K003", "text": "Tomato Bacterial Spot is caused by Xanthomonas bacteria. Symptoms include small dark spots on leaves and fruit. Treatment: Use copper sprays, practice crop rotation, use disease-free seeds."},
            {"id": "K004", "text": "Tomato Leaf Mold is caused by Passalora fulva fungus. Symptoms include pale green to yellow spots on upper leaf surfaces. Treatment: Improve air circulation, reduce humidity, apply fungicides."},
            {"id": "K005", "text": "Potato Early Blight shows similar symptoms to tomato. Dark lesions with target-like patterns. Prevention: Crop rotation, resistant varieties, fungicide application."},
            {"id": "K006", "text": "Healthy crop maintenance: Ensure proper watering (avoid overwatering), adequate sunlight (6-8 hours daily), balanced fertilization, regular monitoring for pests and diseases."},
        ]
        
        print("Initializing knowledge base...")
        for entry in knowledge_entries:
            vector = self.embedder.embed_text(entry['text'])[0]
            self.vectordb.add(vector, entry)
        
        # Save the initialized database
        if self.vectordb.persist_path:
            self.vectordb.save()
        print(f"Knowledge base initialized with {len(self.vectordb)} entries")

    def analyze_crop(self, image_path):
        label, confidence = predict_disease(image_path)
        action = "advice" if confidence > 0.6 else "request_better_image"
        self.history.append({"image": image_path, "label": label, "confidence": confidence})
        return {"label": label, "confidence": confidence, "action": action}
    
    def query_knowledge(self, query_text, top_k=3):
        """
        Query the knowledge base using RAG.
        Returns relevant information based on the query.
        """
        # Embed the query
        query_vector = self.embedder.embed_text(query_text)[0]
        
        # Search the vector database
        results = self.vectordb.search(query_vector, top_k=top_k)
        
        # Format the response
        response = {
            "query": query_text,
            "results": results
        }
        
        return response
    
    def process_voice_query(self, transcribed_text):
        """
        Process a voice query by retrieving relevant knowledge.
        """
        return self.query_knowledge(transcribed_text)

