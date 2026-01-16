"""
Comprehensive test script to verify all modules work correctly.
"""
import sys
import os

# Add project root to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

def test_imports():
    """Test that all modules can be imported."""
    print("="*60)
    print("Testing Imports...")
    print("="*60)
    
    try:
        from src.vision.model import CropDiseaseClassifier
        print("[OK] src.vision.model")
    except Exception as e:
        print(f"[FAIL] src.vision.model: {e}")
        return False
    
    try:
        from src.rag.embeddings import EmbeddingModel
        print("[OK] src.rag.embeddings")
    except Exception as e:
        print(f"[FAIL] src.rag.embeddings: {e}")
        return False
    
    try:
        from src.memory.vectordb import VectorDB
        print("[OK] src.memory.vectordb")
    except Exception as e:
        print(f"[FAIL] src.memory.vectordb: {e}")
        return False
    
    try:
        from src.agents.tools import predict_disease
        print("[OK] src.agents.tools")
    except Exception as e:
        print(f"[FAIL] src.agents.tools: {e}")
        return False
    
    try:
        from src.agents.supervisor import SupervisorAgent
        print("[OK] src.agents.supervisor")
    except Exception as e:
        print(f"[FAIL] src.agents.supervisor: {e}")
        return False
    
    try:
        from src.interfaces.whisper_bot import transcribe_audio
        print("[OK] src.interfaces.whisper_bot")
    except Exception as e:
        print(f"[FAIL] src.interfaces.whisper_bot: {e}")
        return False
    
    return True

def test_rag_pipeline():
    """Test RAG pipeline functionality."""
    print("\n" + "="*60)
    print("Testing RAG Pipeline...")
    print("="*60)
    
    try:
        from src.rag.embeddings import EmbeddingModel
        from src.memory.vectordb import VectorDB
        
        # Initialize
        embedder = EmbeddingModel()
        vectordb = VectorDB()
        
        # Add test data
        test_text = "This is a test document about tomato diseases."
        vector = embedder.embed_text(test_text)[0]
        vectordb.add(vector, {"id": "TEST001", "text": test_text})
        
        # Query
        query_vector = embedder.embed_text("tomato")[0]
        results = vectordb.search(query_vector, top_k=1)
        
        if len(results) > 0 and results[0]['metadata']['id'] == "TEST001":
            print("[OK] RAG pipeline working correctly")
            return True
        else:
            print("[FAIL] RAG pipeline returned unexpected results")
            return False
            
    except Exception as e:
        print(f"[FAIL] RAG pipeline test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_persistence():
    """Test VectorDB persistence."""
    print("\n" + "="*60)
    print("Testing VectorDB Persistence...")
    print("="*60)
    
    try:
        from src.rag.embeddings import EmbeddingModel
        from src.memory.vectordb import VectorDB
        import tempfile
        
        # Create temp file
        temp_path = os.path.join(tempfile.gettempdir(), "test_vectordb.pkl")
        
        # Create and save
        embedder = EmbeddingModel()
        db1 = VectorDB(persist_path=temp_path)
        vector = embedder.embed_text("test")[0]
        db1.add(vector, {"id": "PERSIST_TEST"})
        db1.save()
        
        # Load
        db2 = VectorDB(persist_path=temp_path)
        
        if len(db2) == 1 and db2.metadata[0]['id'] == "PERSIST_TEST":
            print("[OK] Persistence working correctly")
            # Cleanup
            if os.path.exists(temp_path):
                os.remove(temp_path)
            return True
        else:
            print("[FAIL] Persistence failed")
            return False
            
    except Exception as e:
        print(f"[FAIL] Persistence test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_supervisor_agent():
    """Test SupervisorAgent initialization."""
    print("\n" + "="*60)
    print("Testing SupervisorAgent...")
    print("="*60)
    
    try:
        from src.agents.supervisor import SupervisorAgent
        import tempfile
        
        # Use temp path to avoid polluting project
        temp_path = os.path.join(tempfile.gettempdir(), "test_knowledge_base.pkl")
        agent = SupervisorAgent(vectordb_path=temp_path)
        
        # Test query
        response = agent.query_knowledge("How do I treat tomato blight?", top_k=2)
        
        if 'results' in response and len(response['results']) > 0:
            print("[OK] SupervisorAgent working correctly")
            print(f"  Knowledge base has {len(agent.vectordb)} entries")
            # Cleanup
            if os.path.exists(temp_path):
                os.remove(temp_path)
            return True
        else:
            print("[FAIL] SupervisorAgent query failed")
            return False
            
    except Exception as e:
        print(f"[FAIL] SupervisorAgent test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    print("\n" + "="*60)
    print("RAG PROJECT - COMPREHENSIVE TEST SUITE")
    print("="*60 + "\n")
    
    results = {
        "Imports": test_imports(),
        "RAG Pipeline": test_rag_pipeline(),
        "Persistence": test_persistence(),
        "SupervisorAgent": test_supervisor_agent()
    }
    
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    
    for test_name, passed in results.items():
        status = "[OK] PASS" if passed else "[FAIL] FAIL"
        print(f"{test_name:20s}: {status}")
    
    all_passed = all(results.values())
    
    print("\n" + "="*60)
    if all_passed:
        print("ALL TESTS PASSED [OK]")
    else:
        print("SOME TESTS FAILED [FAIL]")
    print("="*60 + "\n")
    
    return all_passed

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
