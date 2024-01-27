import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_API_KEY,
});

const getCourseEvaluationAspects = async (feedback) => {
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "As an aspect-based sentiment analysis model specializing in course reviews, analyze the sentiment associated with specific aspects: instructional effectiveness, learning environment, assessment feedback and fairness, assessment evaluation methods, lecture quality, instructor availability, and classroom interaction. Provide concise insights into positive, neutral, and negative sentiments for each aspect.",
        },
        {
          role: "user",
          content: feedback,
        },
      ],
      model: "ft:gpt-3.5-turbo-1106:group-c::8jRuMq78",
    });
    const parsedContent = JSON.parse(completion.choices[0].message.content);
    return parsedContent;
  } catch (error) {
    console.log("An Error Has Occured, Couldn't Get Aspects");
    throw new Error("An Error Has Occured, Couldn't Get Aspects");
  }
};

export default getCourseEvaluationAspects;
