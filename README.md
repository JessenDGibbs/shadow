# Shadow

Personalized generative search models for every individual. Building the thought space and the cognition. Connect your things, think your way, and tag-team tasks with your Shadow assistant.

Aggregate and think about the information you want in an integrated environment with a personal AI assistant you can send on quests to grab the information and complete tasks.


## Personal Internet
Shadow's engine is an open-source API connecting silos from the internet into a unified space, and embedding it into a singular, unified thought space - for you and your Shadow (AI Assistant). The default Shadow (AI Assistant) is offered by calling the /shadow route and has access to the same digital thought space as you. As you add new information the Shadow learns and becomes more like you: how it thinks, what it knows, and how it acts.

The personal internet i designed to support both digital and physical information so you can connect digital sources as well as physical handwriting, momentary images, and other objects from the real world. Being on the edge of digtial and physical is necesarry for a tool building a digital extension of a phyical human mind.

The API is fully open-source and relies on plugins to reach different silos and we rely on community to help build as many as we can.

## Cognition
Cognition is the Shadow (AI Assistant) that lives on the /shadow route. Shadow's cognition relies on a custom RAG pipeline, fine-tuned online models, and fine-tuned on-device/ off line models. Your Shadow can be with you anywhere you go.

When you call the /shadow route your Shadow crawls the Thought Space while mimicing the patterns of thought it's pickup by the way you aggregate and interact with the information. Deploy your Shadow on questss to grab certain information ans complete tasks with it.

The third element of congition is feedback and training. By default Shadow has a smart RLHF system built in. Whenever you deploy it on a quest and it returns with what it thinks you want it will observe the way to interact with it, editing, follow requests, and when you're finally happy with it, and use the observations to adjust it's behaviour for the next quest.

Cognitition is fully open-source as well an we invite developers to play with different models, RAG systems, embedders, and learning mechanisms.

## Key Features

- **Personal Internet**: Connect applications such as Notion, Google Docs, Dropbox, and Figma, or upload files including annotated PDFs, text documents, and images for comprehensive access through your agent. Overtime the personal internet will grow to connect to every source of digtial and physical information.
- **Shadow (Personal AI Assistant)**: Send your assisant out on research quests to grab the information you need and complete tasks. Adaptive and ultimiately an extension of your own mind.
- **Custom RAG Pipeline**: Powered by a custom Retrieval-Augmented Generation (RAG) pipeline, your AI assistant pulls information from your Thought Space and learns to mimics the way you aggregate, percieve, and interact with information.
- **Online & On-device**: Shadow lays the groundwork for an on-device, fully offline personal internet, prioritizing privacy while maintaining access anywhere you go. When network connection is available online models can be swapped in. Every user will own a set of fine-tuned off-line and on-line models that grow with them.
- **Learning**: A smart RLHF system observes how users interact with infrormation produced by the AI assistant and adapts it's behaviour for it's next quests. Learning is also integrated into general app actions monitoring how you aggregate, interact with, and percieve information.
- **Marketplace Integration**: Optionally list your Shadow and the associated Internet on the Shadow marketplace where users can purchase access through one-time or multi-use licenses. This allows users to get paid for the way they think.

## Getting Started

### Requirements

- Python 3.9 or higher
- Flask

## Front-end requirements if you wish to use it
1. npm
2. React

### Installation

1. Clone the Shadow repository to your local machine.
2. Navigate to the Shadow directory and install the required dependencies in requirements.txt
3. Run the Shadow Flask app locally, or deploy it within a Docker container for enhanced portability and scalability.

### How to Use

Clone the repo and install the requirements

```bash
git clone https://github.com/JessenDGibbs/shadow.git
```

### How to: API
1. add a venv if needed
2. pip install requirements.txt
4. create local directories for /public/user-content, /public/dropbox, /public/chroma-store. Alternatively adjust the routes found in app.py
3. python app.py

### How to: Front-end
1. npm install
2. ensure the routes used in api.js, DocumentCard.js, and ActivityCalendar.js are set to the proper URLs
2. npm start

## Contributing

We welcome contributions from developers interested in expanding the Shadow ecosystem. Whether it's building plugins for additional apps, enhancing the RAG pipeline, or refining the models and embedders, your input can help shape the future of personalized digital experiences.

- **Build Plugins**: Extend the capabilities of Shadow by developing plugins for new applications.
- **Enhance the RAG Pipeline**: Contribute improvements to the retrieval and generation processes.
- **Model Improvements**: Help refine the underlying models to improve performance and accuracy.
- **Else**: Build

## Connect with Us

- **GitHub**: Star and fork the Shadow repository to stay connected with the latest developments.
