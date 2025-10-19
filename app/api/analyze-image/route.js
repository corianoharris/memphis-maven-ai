import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request) {
  try {
    const { image, fileName, context } = await request.json();

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Use Ollama for image analysis if available
    try {
      const analysis = await analyzeImageWithOllama(image, fileName, context);
      return NextResponse.json(analysis);
    } catch (ollamaError) {
      console.log('Ollama not available, using fallback analysis');
      
      // Fallback to basic filename-based analysis
      const fallbackAnalysis = generateBasicAnalysis(fileName, context);
      return NextResponse.json(fallbackAnalysis);
    }
    
  } catch (error) {
    console.error('Error analyzing image:', error);
    return NextResponse.json(
      { error: 'Failed to analyze image' },
      { status: 500 }
    );
  }
}

async function analyzeImageWithOllama(image, fileName, context) {
  const ollamaUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
  
  try {
    const response = await axios.post(`${ollamaUrl}/api/generate`, {
      model: 'llava:7b', // Use a vision-capable model
      prompt: `Analyze this image and provide information relevant to Memphis city services. 
      
      Image filename: ${fileName}
      Context: ${context || 'General Memphis city services'}
      
      Please provide:
      1. A brief description of what you see in the image
      2. How this might relate to Memphis city services, 211/311 services, or community resources
      3. Specific recommendations for Memphis residents
      4. Next steps they should take
      
      Focus on practical Memphis city service connections.`,
      images: [image],
      stream: false
    });

    const content = response.data.response;
    
    // Parse the response and structure it
    return {
      analysis: extractAnalysis(content),
      recommendations: extractRecommendations(content),
      nextSteps: extractNextSteps(content),
      relatedImages: []
    };
    
  } catch (error) {
    console.error('Ollama analysis error:', error);
    throw error;
  }
}

function extractAnalysis(content) {
  // Extract analysis section from the AI response
  const analysisMatch = content.match(/analysis[:\s]*(.*?)(?=recommendations|next steps|$)/is);
  return analysisMatch ? analysisMatch[1].trim() : "I can see this image contains various content that may relate to Memphis city services.";
}

function extractRecommendations(content) {
  // Extract recommendations section
  const recMatch = content.match(/recommendations[:\s]*(.*?)(?=next steps|$)/is);
  if (recMatch) {
    return recMatch[1].trim();
  }
  
  // Fallback: look for numbered lists or bullet points
  const listMatch = content.match(/(\d+\.\s.*?(?:\n\d+\.\s.*?)*)/s);
  return listMatch ? listMatch[1] : "1. **Call Memphis 311** at (901) 636-6500 for assistance\n2. **Visit memphistn.gov** for online services\n3. **Contact the appropriate department** based on your specific needs";
}

function extractNextSteps(content) {
  // Extract next steps section
  const stepsMatch = content.match(/next steps[:\s]*(.*?)$/is);
  if (stepsMatch) {
    return stepsMatch[1].trim();
  }
  
  return "1. Review the information provided\n2. Contact the appropriate Memphis city department\n3. Gather any required documents\n4. Follow up as needed";
}

function generateBasicAnalysis(fileName, context) {
  // Simple fallback analysis when Ollama is not available
  return {
    analysis: `I can see you've shared an image titled "${fileName}". While I can't analyze the visual content directly, I can help you connect with the right Memphis city services.`,
    recommendations: "For assistance with your image, I recommend:\n\n1. **Call Memphis 311** at (901) 636-6500 for general city service questions\n2. **Visit memphistn.gov** for online services and information\n3. **Contact the appropriate department** based on what's in your image\n4. **Visit City Hall** at 125 N Main St for in-person assistance",
    nextSteps: "1. Describe what's in your image to the 311 operator\n2. Ask for the appropriate department contact\n3. Gather any related documents you might need\n4. Schedule an appointment if required",
    relatedImages: []
  };
}
