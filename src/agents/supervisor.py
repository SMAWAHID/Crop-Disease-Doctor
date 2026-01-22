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
            # Tomato Diseases
            {"id": "K001", "text": "Tomato Early Blight is caused by the fungus Alternaria solani. Symptoms include dark brown spots with concentric rings on older leaves. Treatment: Remove infected leaves, apply copper-based fungicides, ensure proper spacing for air circulation."},
            {"id": "K002", "text": "Tomato Late Blight is caused by Phytophthora infestans. Symptoms include water-soaked lesions on leaves and stems, white mold on undersides. Treatment: Apply fungicides immediately, remove infected plants, avoid overhead watering."},
            {"id": "K003", "text": "Tomato Bacterial Spot is caused by Xanthomonas bacteria. Symptoms include small dark spots on leaves and fruit. Treatment: Use copper sprays, practice crop rotation, use disease-free seeds."},
            {"id": "K004", "text": "Tomato Leaf Mold is caused by Passalora fulva fungus. Symptoms include pale green to yellow spots on upper leaf surfaces. Treatment: Improve air circulation, reduce humidity, apply fungicides."},
            {"id": "K005", "text": "Tomato Septoria Leaf Spot appears as small circular spots with dark borders and gray centers. Treatment: Remove infected leaves, apply fungicides, mulch around plants to prevent soil splash."},
            {"id": "K006", "text": "Tomato Mosaic Virus causes mottled light and dark green patterns on leaves. No cure exists. Prevention: Use resistant varieties, control aphids, remove infected plants immediately."},
           
            # Potato Diseases
            {"id": "K007", "text": "Potato Early Blight shows similar symptoms to tomato. Dark lesions with target-like patterns. Prevention: Crop rotation, resistant varieties, fungicide application."},
            {"id": "K008", "text": "Potato Late Blight causes rapid blackening and decay of leaves and tubers. This is the same disease that caused the Irish Potato Famine. Treatment: Preventive fungicide sprays, destroy infected plants."},
            
            # General Plant Issues
            {"id": "K009", "text": "Yellow leaves (chlorosis) can indicate nitrogen deficiency, overwatering, or root damage. Solution: Check soil drainage, apply balanced fertilizer, inspect roots for rot."},
            {"id": "K010", "text": "Brown leaf edges or tips often result from water stress, fertilizer burn, or low humidity. Solution: Adjust watering schedule, dilute fertilizers, increase humidity for sensitive plants."},
            {"id": "K011", "text": "Red or purple leaves can indicate phosphorus deficiency or cold stress. Solution: Add phosphorus-rich fertilizer, protect plants from cold temperatures."},
            {"id": "K012", "text": "Wilting plants may suffer from root rot, underwatering, or vascular diseases. Check soil moisture and roots. If roots are brown and mushy, it's root rot - improve drainage."},
            
            # Pest Management
            {"id": "K013", "text": "Aphids are small soft-bodied insects that suck plant sap. Control: Spray with water, use insecticidal soap, introduce ladybugs as natural predators."},
            {"id": "K014", "text": "Spider mites cause tiny yellow spots and fine webbing. Control: Increase humidity, spray with water, use miticides if severe."},
            {"id": "K015", "text": "Caterpillars and worms eat leaves and fruit. Control: Hand-pick, use Bt (Bacillus thuringiensis), cover plants with row covers."},
            
            # General Care
            {"id": "K016", "text": "Healthy crop maintenance: Ensure proper watering (avoid overwatering), adequate sunlight (6-8 hours daily), balanced fertilization, regular monitoring for pests and diseases."},
            {"id": "K017", "text": "Crop rotation helps prevent soil-borne diseases and pest buildup. Rotate plant families every 2-3 years. Don't plant tomatoes where tomatoes, potatoes, or peppers grew recently."},
            {"id": "K018", "text": "Proper plant spacing improves air circulation, reducing fungal diseases. Follow recommended spacing for each crop type. Overcrowding invites disease."},
            
            # Fungal Diseases
            {"id": "K019", "text": "Powdery mildew appears as white powdery coating on leaves. Thrives in humid conditions with poor air flow. Treatment: Improve ventilation, apply sulfur or neem oil, remove infected leaves."},
            {"id": "K020", "text": "Rust diseases cause orange or brown pustules on leaf undersides. Treatment: Remove infected leaves, apply fungicides, ensure good air circulation."},
            
            # Soil & Nutrition
            {"id": "K021", "text": "Soil pH affects nutrient availability. Most vegetables prefer pH 6.0-7.0. Test soil annually. Adjust with lime (to raise pH) or sulfur (to lower pH)."},
            {"id": "K022", "text": "Nitrogen deficiency shows as yellowing of older leaves first. Solution: Apply nitrogen-rich fertilizer like blood meal, fish emulsion, or compost."},
            {"id": "K023", "text": "Blossom end rot (dark sunken spots on tomatoes/peppers) indicates calcium deficiency, often from irregular watering. Solution: Maintain consistent moisture, add calcium if soil test confirms deficiency."},
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

