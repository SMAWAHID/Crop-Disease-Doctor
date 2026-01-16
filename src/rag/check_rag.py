import sys
import os

# Add project root to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from src.rag.embeddings import EmbeddingModel
from src.memory.vectordb import VectorDB

def main():
    print("="*60)
    print("RAG Pipeline Test with Persistence")
    print("="*60)
    
    # 1. Initialize Components with persistence
    db_path = "../data/test_vectordb.pkl"
    embedder = EmbeddingModel()
    vectordb = VectorDB(persist_path=db_path)
    
    # 2. Add Sample Data (only if DB is empty)
    if len(vectordb) == 0:
        farm_records = [
            {"id": "F001", "text": "Farm A: Wheat crop affected by rust in field 3. Treated with fungicide X."},
            {"id": "F002", "text": "Farm B: Healthy corn crop. Expected yield 200 bushels/acre."},
            {"id": "F003", "text": "Farm A: Tomato blight detected. Humidity was high last week."},
            {"id": "F004", "text": "Farm C: Potato harvest successful. No signs of rot."},
        ]
        
        print(f"\nIngesting {len(farm_records)} records...")
        for record in farm_records:
            vector = embedder.embed_text(record['text'])[0]
            vectordb.add(vector, record)
            print(f"  Added: {record['id']}")
        
        # Save to disk
        vectordb.save()
    else:
        print(f"\nLoaded existing database with {len(vectordb)} entries")
        
    # 3. Query
    query_text = "What disease affected the tomato crop?"
    print(f"\n{'='*60}")
    print(f"Query: '{query_text}'")
    print(f"{'='*60}")
    
    query_vector = embedder.embed_text(query_text)[0]
    results = vectordb.search(query_vector, top_k=2)
    
    print("\nResults:")
    for i, res in enumerate(results, 1):
        print(f"\n  [{i}] Score: {res['score']:.4f}")
        print(f"      ID: {res['metadata']['id']}")
        print(f"      Text: {res['metadata']['text']}")
    
    print(f"\n{'='*60}")
    print("Test completed successfully!")
    print(f"{'='*60}")

if __name__ == "__main__":
    main()
