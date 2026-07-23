/*
 * data.js
 * ---------------------------------------------------------------
 * ALL content for the interview-prep dashboard lives in this file.
 * app.js only knows how to render these structures — it never
 * hard-codes topic text. To add or edit content, edit the arrays
 * below and refresh the page. No build step required.
 *
 * Structures:
 *   TOPICS               -> array of topic objects (mldl / genai / sysdesign)
 *   DSA_CATEGORIES       -> array of DSA category objects, each with problems[]
 *   BEHAVIORAL_QUESTIONS -> array of behavioral question objects
 *   STAR_GUIDE           -> short original explainer string
 * ---------------------------------------------------------------
 */

// ---------------------------------------------------------------
// TOPICS
// Fields:
//   id        - unique slug, used in the #topic/<id> route
//   title     - display title
//   category  - 'mldl' | 'genai' | 'sysdesign'
//   tier      - 'core' | 'common' | 'advanced'  (drives the tag color/label)
//   summary   - 1-2 sentence teaser shown on the card
//   content   - full explanation, multiple paragraphs separated by \n\n
//   keyPoints - array of short bullet strings ("if you remember nothing else...")
// ---------------------------------------------------------------

const TOPICS = [
  // ============================= ML/DL FUNDAMENTALS =============================
  {
    id: "activation-functions",
    title: "Activation Functions",
    category: "mldl",
    tier: "core",
    summary: "Activation functions inject non-linearity into a network, deciding what shapes it can model and how well gradients flow during training.",
    content:
`Without a non-linear activation, stacking layers is pointless — a chain of linear transforms collapses into a single linear transform no matter how deep the network is. Activations are what actually give depth its expressive power.

Sigmoid and tanh squash outputs into a bounded range but saturate for large-magnitude inputs, which pushes gradients toward zero and stalls learning in deep networks. This is the classic vanishing gradient problem, and it's a big reason sigmoid/tanh fell out of favor for hidden layers.

ReLU (max(0, x)) largely fixed this: the gradient is a constant 1 for positive inputs, it's cheap to compute, and in practice it converges noticeably faster. Its downside is the "dying ReLU" failure mode — if a large negative bias or update pushes a unit permanently below zero, its gradient is zero forever and it stops learning.

Leaky ReLU and ELU patch this by allowing a small non-zero slope for negative inputs. GELU, which weights inputs by their value under the standard normal CDF instead of a hard cutoff, is smoother still and is the default activation inside most modern transformer blocks (BERT, GPT-family, etc.).

Softmax is a special case reserved for the output layer of multi-class classifiers — it converts a vector of logits into a probability distribution that sums to 1, and pairs naturally with cross-entropy loss.`,
    keyPoints: [
      "Non-linearity is the whole point — without it, depth adds no expressive power",
      "Sigmoid/tanh saturate and cause vanishing gradients in deep networks",
      "ReLU is cheap and mostly avoids saturation, but units can 'die' and stop updating",
      "Leaky ReLU/ELU/GELU keep a small or smooth gradient for negative inputs",
      "GELU is the de facto standard inside transformer blocks",
      "Softmax belongs only at the output of multi-class classifiers"
    ]
  },
  {
    id: "bias-variance-tradeoff",
    title: "Bias-Variance Tradeoff",
    category: "mldl",
    tier: "core",
    summary: "A framework for decomposing generalization error into bias, variance, and irreducible noise, and for reasoning about model complexity.",
    content:
`Bias is the error introduced by approximating a real, possibly complex relationship with a simplified model — a linear model fit to non-linear data has high bias and will underfit regardless of how much data you throw at it. Variance is the error introduced by the model's sensitivity to the particular training sample it saw — a deep, unconstrained decision tree can memorize noise and swing wildly if you retrain it on a slightly different sample, meaning it overfits.

Total expected error decomposes (for squared loss) into bias squared, plus variance, plus irreducible noise from the data-generating process itself. You cannot eliminate the noise term, so the practical lever is trading bias against variance: increasing model capacity (more features, deeper trees, more parameters) tends to lower bias but raise variance, and regularizing or simplifying the model does the opposite.

In practice this shows up as the classic U-shaped validation curve: training error keeps dropping as capacity increases, while validation error drops, bottoms out, then rises again once the model starts fitting noise. The sweet spot is where validation error is minimized, not where training error is minimized.

Common techniques for managing the tradeoff: regularization (L1/L2, dropout) to reduce variance, ensembling (bagging reduces variance, boosting reduces bias), getting more training data (mainly reduces variance), and feature engineering or increasing model capacity to reduce bias. Interviewers often ask you to diagnose which regime a learning curve implies — a large train/val gap signals high variance; both curves converging to a high error plateau signals high bias.`,
    keyPoints: [
      "Bias = error from an overly simple model (underfitting)",
      "Variance = error from sensitivity to the training sample (overfitting)",
      "Total error ≈ bias² + variance + irreducible noise",
      "More capacity typically trades lower bias for higher variance",
      "A large train/val gap points to variance; a high error plateau on both points to bias",
      "Regularization and ensembling are the standard levers to rebalance the tradeoff"
    ]
  },
  {
    id: "clustering-pca",
    title: "Clustering & PCA",
    category: "mldl",
    tier: "core",
    summary: "Unsupervised techniques for finding structure in unlabeled data: clustering groups similar points, PCA finds low-dimensional directions of maximum variance.",
    content:
`K-means partitions data into k clusters by iterating between assigning points to the nearest centroid and recomputing centroids as the mean of their assigned points, minimizing within-cluster sum of squares. It's fast and scalable but assumes roughly spherical, similarly-sized clusters, requires choosing k up front (elbow method or silhouette score help), and is sensitive to initialization (k-means++ mitigates this) and to feature scale, so standardizing features first matters.

Hierarchical clustering builds a tree of merges (agglomerative, bottom-up) or splits (divisive, top-down) based on a linkage criterion, giving you a dendrogram you can cut at any level — useful when you don't want to commit to a fixed k. DBSCAN instead groups points by density, which lets it find arbitrarily shaped clusters and naturally label sparse points as noise/outliers, at the cost of two hyperparameters (epsilon neighborhood radius, minimum points) that can be finicky to tune.

PCA is a dimensionality-reduction technique, not a clustering technique, but the two are often used together. PCA finds orthogonal directions (principal components) that successively capture the maximum remaining variance in the data, computed via eigendecomposition of the covariance matrix (or SVD of the centered data matrix, which is more numerically stable). Projecting onto the top k components compresses the data while preserving as much variance as possible, which helps with visualization, noise reduction, mitigating the curse of dimensionality, and speeding up downstream models.

Key caveat interviewers probe: PCA components are linear combinations of the original features and lose direct interpretability, and PCA is sensitive to feature scaling — always standardize before applying it unless features are already on comparable scales.`,
    keyPoints: [
      "K-means minimizes within-cluster variance; needs k chosen up front and scaled features",
      "DBSCAN clusters by density, finds arbitrary shapes, and naturally flags outliers",
      "Hierarchical clustering gives a dendrogram you can cut at any granularity",
      "PCA finds orthogonal directions of maximum variance via eigendecomposition/SVD",
      "PCA reduces dimensionality but sacrifices direct feature interpretability",
      "Always standardize features before PCA or k-means"
    ]
  },
  {
    id: "ensemble-methods",
    title: "Ensemble Methods",
    category: "mldl",
    tier: "core",
    summary: "Combining multiple weak or diverse models — via bagging, boosting, or stacking — usually beats any single model on generalization.",
    content:
`Bagging (bootstrap aggregating) trains many instances of the same model type on different bootstrap samples of the training data and averages their predictions (or votes, for classification). Because each model overfits differently to its own resample, averaging cancels out variance while leaving bias roughly unchanged — this is exactly why random forests, which additionally randomize the feature subset considered at each split, are such strong, low-fuss baselines.

Boosting takes the opposite approach: it trains models sequentially, where each new model focuses on the errors (residuals, or reweighted hard examples) of the ensemble so far. This primarily reduces bias, letting a series of weak learners (often shallow trees) combine into a strong one. Gradient boosting frames this as gradient descent in function space — each new tree is fit to the negative gradient of the loss with respect to the current predictions. XGBoost, LightGBM, and CatBoost are production-grade implementations that add regularization, efficient split-finding, and native handling of missing values or categoricals.

Stacking generalizes both ideas: train several different base models, then train a meta-model on their out-of-fold predictions to learn how to best combine them. It can capture complementary strengths across model families but adds complexity and overfitting risk if not cross-validated carefully.

Interview framing: bagging trades variance for stability and parallelizes trivially; boosting trades bias for accuracy but trains sequentially and is more prone to overfitting if unregularized (watch learning rate, tree depth, and early stopping on a validation set).`,
    keyPoints: [
      "Bagging averages independently trained models to reduce variance (e.g. random forest)",
      "Boosting trains sequentially on residuals/errors to reduce bias (e.g. XGBoost)",
      "Gradient boosting = gradient descent in function space using weak learners",
      "Stacking learns a meta-model over multiple base models' predictions",
      "Bagging parallelizes easily; boosting is sequential and needs careful regularization",
      "Random forests are a strong, low-tuning-effort default baseline"
    ]
  },
  {
    id: "evaluation-metrics",
    title: "Evaluation Metrics",
    category: "mldl",
    tier: "core",
    summary: "Choosing the right metric — not just accuracy — is often the difference between a model that looks good and one that's actually useful.",
    content:
`For classification, accuracy is misleading whenever classes are imbalanced — a model that always predicts "not fraud" can be 99% accurate and useless. Precision (of predicted positives, how many were correct) and recall (of actual positives, how many were caught) capture the two ways a classifier can fail, and F1 is their harmonic mean when you need one number balancing both. The right precision/recall tradeoff is a business decision, not a modeling one: a cancer screening test wants high recall (don't miss real cases), a spam filter wants high precision (don't block real email).

ROC-AUC measures ranking quality across all classification thresholds by plotting true positive rate against false positive rate, and is threshold-independent — useful for comparing models, less useful when classes are heavily imbalanced, where PR-AUC (precision-recall AUC) is more informative because it doesn't get inflated by the abundance of true negatives.

For regression, MAE (mean absolute error) is robust to outliers and easy to interpret in the original units; MSE/RMSE penalize large errors quadratically, which is appropriate when large mistakes are disproportionately costly but makes the metric sensitive to outliers. R² measures the fraction of variance explained relative to a naive mean predictor, but can be misleadingly high with enough features regardless of real predictive power (adjusted R² partially corrects for this).

Interviewers frequently ask you to pick a metric given a business scenario — always anchor the answer in what a false positive vs. false negative costs the business, not in which metric is "best" abstractly.`,
    keyPoints: [
      "Accuracy is misleading under class imbalance — use precision/recall/F1 instead",
      "Precision-recall tradeoff should be set by business cost, not a fixed default",
      "ROC-AUC is threshold-independent but overly optimistic on imbalanced data — prefer PR-AUC there",
      "MAE is outlier-robust; RMSE penalizes large errors more heavily",
      "R² can look good even with weak real predictive power as features are added",
      "Always tie metric choice to the cost of false positives vs false negatives"
    ]
  },
  {
    id: "feature-engineering",
    title: "Feature Engineering",
    category: "mldl",
    tier: "core",
    summary: "Transforming raw data into representations a model can actually exploit — often the highest-leverage work in an ML project.",
    content:
`Feature engineering is frequently what separates a mediocre model from a great one, because most algorithms can't discover useful transformations of raw inputs on their own. For numeric features this includes scaling (standardization for algorithms sensitive to feature magnitude like linear/logistic regression, SVMs, and neural nets; not needed for tree-based models), log or Box-Cox transforms to tame skewed distributions, binning continuous variables, and creating interaction or polynomial terms when you suspect non-additive effects.

For categorical features, one-hot encoding works for low-cardinality columns but explodes dimensionality for high-cardinality ones (e.g. zip codes, user IDs); target encoding (replacing a category with a statistic of the target, computed out-of-fold to avoid leakage) or frequency encoding scale better in that regime. Ordinal encoding is appropriate only when categories have a genuine order.

Datetime features are rarely useful raw — decomposing into day-of-week, hour, month, is-weekend, or time-since-last-event, and encoding cyclical features (hour, day-of-week) with sine/cosine transforms so midnight and 11pm aren't treated as maximally distant, both tend to unlock real signal. Text and other unstructured data get their own feature-extraction pipelines (TF-IDF, embeddings) but the same principle applies: represent the raw signal in a form the model's inductive bias can use.

The single biggest pitfall interviewers probe for is data leakage — engineering a feature using information that wouldn't be available at prediction time (e.g. a "total purchases" feature computed after the fact), or fitting an encoder/scaler on the full dataset instead of the training fold only.`,
    keyPoints: [
      "Feature engineering often has more impact on model quality than algorithm choice",
      "Scale numeric features for distance/gradient-based models; trees don't need it",
      "High-cardinality categoricals need target/frequency encoding, not one-hot",
      "Decompose datetime features and encode cyclical ones with sine/cosine",
      "Data leakage — using future or target-derived info at train time — is the top pitfall",
      "Fit encoders/scalers on the training fold only, never on the full dataset"
    ]
  },
  {
    id: "imbalanced-data",
    title: "Imbalanced Data Handling",
    category: "mldl",
    tier: "common",
    summary: "Techniques for training useful classifiers when one class vastly outnumbers another, a near-universal issue in fraud, churn, and medical data.",
    content:
`When one class is rare, a naive classifier can achieve high accuracy by essentially ignoring it, so the first fix is always metric selection: switch to precision/recall/F1, PR-AUC, or a cost-weighted metric that actually reflects the harm of missing the minority class, before touching the training process at all.

At the data level, oversampling the minority class (random duplication, or synthetically via SMOTE, which interpolates between nearby minority examples) and undersampling the majority class are the two levers, often used together. Both have failure modes: naive oversampling can encourage overfitting to duplicated points, and undersampling throws away potentially useful majority-class information — so these should be applied only to the training fold, never before the train/test split, to avoid leaking synthetic or duplicated points across the boundary.

At the algorithm level, class weighting (penalizing misclassifications of the minority class more heavily in the loss function, e.g. class_weight='balanced' in scikit-learn, or a weighted cross-entropy) achieves a similar effect without manipulating the dataset, and is usually the cleaner first thing to try. Threshold tuning is a distinct, often-overlooked lever — a model trained normally but with its decision threshold moved off 0.5 (chosen via the PR curve to hit a target recall or precision) can outperform elaborate resampling with far less complexity.

For extreme imbalance (fraud at 0.1% positive rate), anomaly-detection framings (isolation forest, autoencoder reconstruction error) sometimes outperform standard supervised classifiers entirely. Interviewers want to see that you reach for the simplest effective fix first — usually class weights plus threshold tuning — before jumping to SMOTE.`,
    keyPoints: [
      "Fix the metric first — accuracy is meaningless under imbalance",
      "SMOTE/oversampling and undersampling must be applied only within the training fold",
      "Class weighting is often a cleaner first lever than resampling the dataset",
      "Threshold tuning off the default 0.5 is a cheap, high-leverage, often-overlooked fix",
      "Extreme imbalance may call for anomaly-detection framings instead of classification",
      "Always reason from the real-world cost of missing the minority class"
    ]
  },
  {
    id: "loss-functions",
    title: "Loss Functions",
    category: "mldl",
    tier: "core",
    summary: "The loss function defines what 'good' means to a model during training — the choice shapes both optimization behavior and the resulting predictions.",
    content:
`For regression, MSE (mean squared error) penalizes large errors quadratically, which pulls predictions toward the conditional mean and makes it sensitive to outliers; MAE (mean absolute error) penalizes all errors linearly and pulls toward the conditional median, making it more robust but non-differentiable at zero. Huber loss blends the two — quadratic for small errors, linear for large ones — giving outlier robustness while staying smooth near zero, at the cost of an extra hyperparameter (the delta threshold).

For binary classification, binary cross-entropy (log loss) measures the divergence between predicted probability and the true label, and its gradient has a nice property: the further off a confident wrong prediction is, the larger the gradient, so it drives learning hard exactly where the model is most wrong. Categorical cross-entropy generalizes this to multi-class problems (paired with softmax output), while hinge loss (used by SVMs) instead just wants the correct class's score to beat others by a margin, without demanding calibrated probabilities.

Beyond the basics: focal loss down-weights easy, already-well-classified examples so training focuses on hard ones, which is valuable for extreme class imbalance (originally introduced for dense object detection). Contrastive and triplet losses train embeddings so that similar items land close together and dissimilar ones land far apart, foundational for face recognition and retrieval systems.

The interview-relevant point is that loss function and evaluation metric are not the same thing — you optimize a smooth, differentiable proxy (loss) during training but report a business-relevant metric (like F1 or AUC) that may not be directly differentiable.`,
    keyPoints: [
      "MSE penalizes large errors more and targets the mean; MAE is outlier-robust and targets the median",
      "Huber loss blends MSE and MAE behavior via a threshold hyperparameter",
      "Cross-entropy drives strong gradients on confident wrong predictions",
      "Focal loss down-weights easy examples to handle severe class imbalance",
      "Contrastive/triplet losses shape embedding spaces for retrieval and recognition",
      "Loss (optimized) and evaluation metric (reported) serve different purposes and can diverge"
    ]
  },
  {
    id: "optimizers",
    title: "Optimizers",
    category: "mldl",
    tier: "core",
    summary: "Optimizers control how model weights are updated from gradients — the choice affects convergence speed, stability, and final generalization.",
    content:
`Vanilla stochastic gradient descent (SGD) updates weights by stepping opposite the gradient of the loss on a mini-batch, scaled by a learning rate. It's simple and, with the right learning-rate schedule, often generalizes as well as or better than fancier optimizers, but it can be slow to navigate loss surfaces with steep curvature in some directions and shallow curvature in others (it oscillates across ravines instead of moving efficiently along them).

SGD with momentum accumulates a moving average of past gradients so updates keep moving in a consistent direction, damping oscillations and speeding convergence through ravines. Adam goes further, maintaining per-parameter estimates of both the first moment (mean, like momentum) and second moment (uncentered variance) of gradients, effectively giving every parameter its own adaptive learning rate — this makes it fast to converge and forgiving of learning-rate choice, which is why it's the default starting point for most deep learning work, especially transformers.

The tradeoff: Adam's adaptivity can sometimes lead to worse generalization than well-tuned SGD+momentum, particularly on vision tasks with heavy data augmentation, because it can converge to sharper minima. AdamW decouples weight decay from the gradient-based update (rather than folding it into the gradient like standard L2 regularization does inside Adam), which fixes a subtle bug in how Adam and weight decay interact and is now the standard choice for training transformers.

Learning rate schedules (warmup, then cosine or linear decay) matter as much as optimizer choice — warmup avoids destabilizing large early updates, and decay lets the model settle into a sharper, better minimum as training ends.`,
    keyPoints: [
      "SGD is simple and can generalize well but is slow across ill-conditioned loss surfaces",
      "Momentum smooths updates by averaging past gradients, speeding convergence",
      "Adam adapts a per-parameter learning rate using first and second gradient moments",
      "AdamW decouples weight decay from the gradient update, fixing Adam's regularization behavior",
      "Adam converges fast but can generalize worse than tuned SGD+momentum in some settings",
      "Learning-rate warmup + decay schedules matter as much as the optimizer itself"
    ]
  },
  {
    id: "regularization",
    title: "Regularization",
    category: "mldl",
    tier: "core",
    summary: "Techniques that constrain a model's capacity or penalize complexity to reduce overfitting and improve generalization to unseen data.",
    content:
`L2 regularization (weight decay) adds a penalty proportional to the sum of squared weights to the loss, which shrinks all weights smoothly toward zero without forcing any to exactly zero — good for reducing variance while keeping all features in play. L1 regularization penalizes the sum of absolute weights, which tends to push many weights exactly to zero, effectively performing feature selection; this makes it useful when you suspect only a subset of features truly matter and want a sparse, interpretable model. Elastic net combines both when you want some sparsity without L1's instability when features are correlated.

Dropout, specific to neural networks, randomly zeroes out a fraction of activations during each training forward pass, which prevents units from co-adapting and can be viewed as training an implicit ensemble of thinned sub-networks that get averaged at inference time. Early stopping halts training once validation loss stops improving, which is a cheap and often underrated regularizer since it directly targets the actual overfitting signal rather than a proxy.

Data augmentation (image flips/crops/color jitter, text back-translation, etc.) regularizes by exposing the model to more variation without collecting new labeled data, and is often more impactful than tweaking a penalty coefficient. Batch normalization has a mild regularizing side effect too, by adding noise through batch statistics during training.

Interview framing: regularization strength is itself a hyperparameter to tune via validation performance, not a fixed default — too much regularization just trades overfitting for underfitting.`,
    keyPoints: [
      "L2 shrinks weights smoothly (reduces variance); L1 drives some weights to exactly zero (feature selection)",
      "Elastic net blends L1 and L2, handling correlated features better than L1 alone",
      "Dropout trains an implicit ensemble of sub-networks by randomly zeroing activations",
      "Early stopping regularizes directly against the validation-loss signal",
      "Data augmentation is often the highest-leverage regularizer for perception tasks",
      "Regularization strength must be tuned — too much just trades overfitting for underfitting"
    ]
  },
  {
    id: "transformers-architecture",
    title: "Transformers Architecture",
    category: "mldl",
    tier: "core",
    summary: "The self-attention-based architecture behind essentially all modern large language and vision-language models, replacing recurrence with parallel, position-aware attention.",
    content:
`Before transformers, RNNs/LSTMs processed sequences step by step, which made them slow to train (no parallelism across time steps) and prone to losing long-range dependencies despite gating mechanisms. Self-attention instead lets every token directly attend to every other token in a sequence in one shot, computing a weighted combination of "value" vectors where the weights come from how well each token's "query" matches every other token's "key" — this is the scaled dot-product attention at the core of the architecture.

Multi-head attention runs several attention operations in parallel with different learned projections, letting the model capture different types of relationships (syntactic, positional, semantic) simultaneously, then concatenates and projects the results. Because attention itself has no notion of order, positional encodings (sinusoidal in the original paper, learned or rotary — RoPE — in most modern models) are added so the model knows token order.

A transformer block stacks multi-head attention with a position-wise feed-forward network, wrapped in residual connections and layer normalization, which together keep gradients well-behaved across many stacked layers. The original architecture had an encoder (bidirectional attention, good for understanding tasks — BERT) and a decoder (causal/masked attention so a token can't see future tokens, good for generation — GPT); most modern LLMs use a decoder-only architecture trained purely to predict the next token.

Interview-relevant details: self-attention is O(n²) in sequence length, which motivates efficient-attention research (sparse, linear, FlashAttention) for long contexts; and "attention is not literally interpretability" — attention weights are suggestive but not a rigorous explanation of model behavior.`,
    keyPoints: [
      "Self-attention lets every token attend to every other token in parallel, unlike sequential RNNs",
      "Scaled dot-product attention: weight values by query-key similarity",
      "Multi-head attention captures multiple relationship types in parallel subspaces",
      "Positional encodings (sinusoidal/learned/RoPE) restore order information attention lacks",
      "Residual connections + layer norm keep gradients stable across many stacked blocks",
      "Most modern LLMs are decoder-only with causal (masked) attention, trained to predict the next token"
    ]
  },
  {
    id: "pytorch-essentials",
    title: "PyTorch Essentials",
    category: "mldl",
    tier: "common",
    summary: "The core PyTorch concepts — tensors, autograd, and the training loop — that come up in almost any hands-on ML interview or take-home.",
    content:
`A PyTorch 'Tensor' is like a NumPy array but can live on GPU and tracks operations for automatic differentiation when requires_grad=True. Autograd builds a dynamic computation graph as operations execute (define-by-run, unlike older static-graph frameworks), and calling .backward() on a scalar loss walks that graph in reverse, accumulating gradients into each tensor's .grad attribute via the chain rule.

A model is typically a subclass of 'nn.Module', defining its layers in __init__ and the forward computation in forward(); PyTorch auto-generates the backward pass, so you almost never write gradient code by hand. The standard training loop pattern is: forward pass to get predictions, compute loss, call optimizer.zero_grad() to clear stale gradients (they accumulate by default), call loss.backward() to populate gradients, then optimizer.step() to apply the update.

'DataLoader' wraps a 'Dataset' to handle batching, shuffling, and parallel data loading via worker processes, which is usually the actual bottleneck in training throughput, not the GPU compute itself. model.train() and model.eval() toggle behavior for layers like dropout and batch norm that behave differently at train vs. inference time — a very common bug source is forgetting to call .eval() before validation/inference, which leaves dropout active and batch norm using batch statistics instead of running statistics.

torch.no_grad() (or the @torch.inference_mode() decorator) disables gradient tracking during inference, saving memory and compute since no backward pass is needed. Interviewers often probe for the zero_grad/backward/step ordering and the train/eval distinction specifically because they're such common real-world bugs.`,
    keyPoints: [
      "Autograd builds a dynamic graph at runtime and computes gradients via backward()",
      "nn.Module subclasses define forward(); PyTorch derives the backward pass automatically",
      "Training loop order: zero_grad() → forward → loss → backward() → optimizer.step()",
      "Gradients accumulate by default — always zero them each iteration",
      "model.train() vs model.eval() changes dropout/batchnorm behavior — a classic bug source",
      "torch.no_grad() disables tracking during inference to save memory and compute"
    ]
  },
  {
    id: "train-val-test-splits",
    title: "Train/Val/Test Splits & Cross-Validation",
    category: "mldl",
    tier: "core",
    summary: "How you split and validate data determines whether your performance estimate is trustworthy or just a leaked, overly optimistic number.",
    content:
`The basic three-way split — train to fit parameters, validation to tune hyperparameters and make model-selection decisions, test to report a final, untouched estimate of real-world performance — exists because reusing the same data for both fitting and evaluating produces an overly optimistic estimate. The moment you make any decision (which model, which hyperparameters, when to stop) based on a dataset's performance, that dataset is no longer an unbiased estimate of generalization for that decision, which is precisely why the test set must be touched exactly once, at the very end.

K-fold cross-validation improves on a single validation split by partitioning the training data into k folds, training k times with each fold held out once, and averaging the validation metric — this gives a lower-variance performance estimate and uses data more efficiently, which matters when data is scarce. Stratified k-fold preserves class proportions in each fold and is the default choice for imbalanced classification. Leave-one-out is the extreme case (k = n), rarely used outside very small datasets due to cost.

Time series data breaks the i.i.d. assumption behind random splitting — you must split chronologically (train on the past, validate/test on the future) and use expanding or rolling-window cross-validation, or you'll leak future information into training and wildly overestimate performance. Grouped data (multiple rows per user, patient, or entity) needs group-aware splitting (GroupKFold) so the same entity never appears in both train and validation, another common leakage trap.

Interviewers frequently probe leakage scenarios specifically — recognizing "you can't randomly shuffle time series" or "you can't split by row when a user has many rows" is a strong signal of practical experience.`,
    keyPoints: [
      "Test set performance must be reported once, at the very end, never used for tuning",
      "K-fold CV lowers variance in the performance estimate versus one train/val split",
      "Stratified k-fold preserves class balance across folds for imbalanced data",
      "Time series requires chronological, not random, splitting to avoid future leakage",
      "Grouped/clustered data needs GroupKFold so an entity never spans train and validation",
      "Any decision made using a dataset invalidates it as an unbiased estimate for that decision"
    ]
  },
  {
    id: "reinforcement-learning-basics",
    title: "Reinforcement Learning Basics",
    category: "mldl",
    tier: "advanced",
    summary: "The framework of agents learning by trial and error via rewards — foundational vocabulary for RLHF, recommendation bandits, and agentic systems.",
    content:
`RL formalizes a problem as an agent interacting with an environment through states, actions, and rewards, typically modeled as a Markov Decision Process (MDP): the next state and reward depend only on the current state and action, not on the full history. The agent's goal is to learn a policy — a mapping from states to actions — that maximizes expected cumulative (often discounted) reward over time. The discount factor gamma trades off immediate vs. future reward and also keeps infinite-horizon sums finite.

Value-based methods (like Q-learning) learn the expected return of taking a given action in a given state and then act greedily with respect to that estimate; deep Q-networks (DQN) extend this with a neural network function approximator plus tricks like experience replay and target networks to stabilize training. Policy-gradient methods instead directly parameterize and optimize the policy by following the gradient of expected reward, which handles continuous action spaces more naturally and can learn stochastic policies; actor-critic methods (like PPO, widely used in practice) combine a policy (actor) with a learned value function (critic) that reduces the variance of the policy gradient estimate.

The exploration-exploitation tradeoff is central: an agent that only exploits its current best-known action never discovers better ones, but pure exploration wastes reward on known-bad actions — epsilon-greedy, softmax/Boltzmann exploration, and upper-confidence-bound methods are standard approaches, and multi-armed bandits are the simplified, stateless special case common in recommendation and A/B testing contexts.

RL's biggest interview-relevant modern application is RLHF (reinforcement learning from human feedback), where PPO fine-tunes an LLM's policy (its next-token distribution) against a learned reward model trained on human preference comparisons.`,
    keyPoints: [
      "RL problems are typically modeled as MDPs: state, action, reward, transition",
      "Value-based methods (Q-learning/DQN) estimate expected return per action; policy-gradient methods directly optimize the policy",
      "Actor-critic (e.g. PPO) combines both to reduce policy-gradient variance",
      "The exploration-exploitation tradeoff is fundamental — epsilon-greedy and UCB are standard tools",
      "Multi-armed bandits are the stateless special case, common in recommendations/A-B testing",
      "RLHF applies policy-gradient RL (PPO) to align LLMs with a learned human-preference reward model"
    ]
  },
  {
    id: "advanced-computer-vision",
    title: "Advanced Computer Vision",
    category: "mldl",
    tier: "advanced",
    summary: "Beyond basic CNNs: object detection, segmentation, and vision transformers, and the tradeoffs between them for real-world perception tasks.",
    content:
`Convolutional neural networks exploit two inductive biases well-suited to images: locality (nearby pixels are more related than distant ones, so small filters suffice) and translation equivariance (a filter that detects an edge in one location can detect it anywhere via weight sharing). Stacking convolution, non-linearity, and pooling/downsampling layers builds up a hierarchy from low-level features (edges, textures) to high-level semantic ones (parts, objects), which is why classification backbones like ResNet became the standard trunk for most vision tasks.

Object detection extends classification to also localize objects. Two-stage detectors (Faster R-CNN) first propose candidate regions then classify/refine them, generally more accurate but slower; single-stage detectors (YOLO, SSD) predict boxes and classes directly in one pass over a grid, trading some accuracy for real-time speed. Semantic segmentation classifies every pixel (U-Net's encoder-decoder with skip connections is a workhorse architecture, especially in medical imaging); instance segmentation (Mask R-CNN) further separates individual object instances within the same class.

Vision transformers (ViT) apply the transformer architecture to images by splitting an image into fixed-size patches, linearly embedding each as a token, and applying standard self-attention — dropping CNNs' locality/translation-equivariance inductive bias entirely. This means ViTs typically need more training data (or careful augmentation/distillation) to match CNN performance from scratch, but they scale exceptionally well and now match or beat CNNs at scale, and unify naturally with multimodal architectures that also process text tokens.

Transfer learning — starting from an ImageNet- or web-scale-pretrained backbone and fine-tuning on your target task — is the default practical approach; from-scratch training is rarely justified unless you have a very large, task-specific dataset.`,
    keyPoints: [
      "CNNs encode locality and translation-equivariance as inductive biases, well-suited to images",
      "Two-stage detectors (Faster R-CNN) favor accuracy; single-stage (YOLO) favors speed",
      "Semantic segmentation labels every pixel; instance segmentation separates individual objects",
      "ViTs apply self-attention to image patches, dropping CNN inductive biases in favor of scale",
      "ViTs generally need more data/compute to match CNNs unless pretrained at scale",
      "Transfer learning from a pretrained backbone is the default practical starting point"
    ]
  },

  // ============================= GENAI & LLMs =============================
  {
    id: "advanced-llm-techniques",
    title: "Advanced LLM Techniques",
    category: "genai",
    tier: "advanced",
    summary: "Techniques beyond basic prompting that push LLM reasoning and reliability further: chain-of-thought, self-consistency, and tool-augmented reasoning.",
    content:
`Chain-of-thought (CoT) prompting asks a model to produce intermediate reasoning steps before its final answer, which measurably improves performance on multi-step arithmetic, logic, and planning tasks — the working theory is that it gives the model more forward computation ("thinking tokens") to arrive at a correct answer, rather than trying to jump straight to one. Zero-shot CoT (simply appending "let's think step by step") and few-shot CoT (showing worked examples) are the two common flavors.

Self-consistency improves on single-pass CoT by sampling multiple reasoning paths at a non-zero temperature and taking a majority vote over the final answers, which reduces the variance from any one flawed reasoning chain at the cost of extra inference calls. Tree-of-thought generalizes this further by exploring and backtracking across a tree of partial reasoning states rather than committing to one linear chain, useful for problems with genuine branching search spaces.

ReAct interleaves reasoning traces with actions (like tool or API calls) and observations, letting a model reason about what it's learned from a tool call before deciding the next step — this is the backbone pattern behind most modern LLM agents. More recent "reasoning models" (trained with reinforcement learning to produce long internal chains of thought before answering) push this further by learning when and how much to reason, rather than relying on a fixed prompting pattern.

Interview-relevant nuance: these techniques trade inference cost and latency for accuracy, so choosing among them is a product decision — self-consistency's extra sampling calls, for instance, are hard to justify for a low-latency chat UI but reasonable for a one-shot offline analysis task.`,
    keyPoints: [
      "Chain-of-thought gives the model intermediate reasoning steps, improving multi-step tasks",
      "Self-consistency samples multiple reasoning paths and majority-votes the answer",
      "Tree-of-thought explores/backtracks across branching reasoning states",
      "ReAct interleaves reasoning with tool calls and observations — the core agent pattern",
      "Dedicated reasoning models learn how much internal reasoning a problem needs",
      "All of these trade inference cost/latency for accuracy — choose based on the product's needs"
    ]
  },
  {
    id: "ai-agents",
    title: "AI Agents",
    category: "genai",
    tier: "advanced",
    summary: "Systems where an LLM plans, calls tools, and observes results in a loop to accomplish multi-step goals, rather than answering in one shot.",
    content:
`An LLM agent extends a plain chat model with three ingredients: tools (functions the model can call — search, code execution, database queries, APIs), memory (short-term conversation context and often a longer-term store), and a control loop that lets the model plan, act, observe the result, and re-plan repeatedly until it decides the task is done. This loop is what turns an LLM from a single-shot text generator into something that can execute multi-step, dynamic workflows.

Tool use in practice relies on "function calling": the model is given structured tool definitions (name, description, parameter schema) and outputs a structured call rather than free text when it decides a tool is needed; the calling application executes the actual function and feeds the result back into context. The ReAct pattern (reason, act, observe, repeat) is the most common loop structure, and gives the model a chance to course-correct based on real tool output rather than committing to a whole plan upfront.

Multi-agent systems assign different roles to multiple LLM instances (e.g. a planner, a coder, a critic/reviewer) that communicate to solve a task collaboratively, which can improve quality on complex tasks through specialization and self-critique, at the cost of more orchestration complexity, latency, and cost.

The practical failure modes interviewers care about: agents can loop indefinitely without termination conditions, hallucinate tool arguments or misuse tools, accumulate errors across many steps (a small per-step error rate compounds badly over 10+ steps), and need guardrails — timeouts, step limits, human-in-the-loop approval for high-stakes actions, and careful scoping of what tools an agent is allowed to touch.`,
    keyPoints: [
      "Agents = LLM + tools + memory + a plan-act-observe control loop",
      "Function calling lets the model emit structured tool calls that the app executes",
      "ReAct (reason, act, observe) is the dominant agent loop pattern",
      "Multi-agent setups specialize roles (planner/coder/critic) at the cost of orchestration overhead",
      "Per-step error rates compound badly over long multi-step agent runs",
      "Guardrails — step limits, timeouts, human approval for risky actions — are essential in production"
    ]
  },
  {
    id: "finetuning-vs-rag",
    title: "Fine-Tuning vs. RAG",
    category: "genai",
    tier: "core",
    summary: "Two different ways to specialize an LLM to your data — one changes model weights, the other changes what's in the prompt — and when to use which.",
    content:
`Fine-tuning updates a pretrained model's weights on your own labeled or curated data, which changes the model's inherent behavior — its tone, style, task-specific skill, or output format — durably, without needing that information present at inference time. RAG (retrieval-augmented generation) instead leaves the model's weights untouched and retrieves relevant documents from an external knowledge base at query time, injecting them into the prompt so the model can ground its answer in that content.

The rule of thumb interviewers want to hear: use RAG when the need is fresh or frequently changing factual knowledge, source attribution/citations, or a large corpus that can't fit in a prompt or in the model's training data — RAG updates are as easy as updating a document store, no retraining needed. Use fine-tuning when the need is a consistent behavior, style, or format change, a narrow task the model isn't naturally good at, or reducing prompt length/latency by baking instructions into the weights instead of repeating them in every prompt.

They are complementary, not mutually exclusive: a common production pattern fine-tunes a model to be better at using retrieved context and following a specific output format, while RAG supplies the actual facts. Fine-tuning is not a good way to teach a model new factual knowledge that must stay current — it's expensive to retrain frequently, doesn't guarantee the model reliably retrieves what it learned, and can't easily attribute an answer back to a source document the way RAG naturally can.

Cost and iteration speed also differ: RAG is cheaper to stand up and iterate on (swap the retriever or documents, no GPU training run needed), while fine-tuning requires curated training data, compute, and evaluation infrastructure, though it can pay off for behavior that's hard to reliably prompt for.`,
    keyPoints: [
      "Fine-tuning changes model weights; RAG changes what's in the prompt via retrieval",
      "Use RAG for fresh/changing facts, source attribution, and large external corpora",
      "Use fine-tuning for consistent style, format, or narrow-task behavior change",
      "Fine-tuning is a poor way to teach frequently-changing factual knowledge",
      "The two are complementary and often combined in production systems",
      "RAG is cheaper/faster to iterate on; fine-tuning needs curated data and compute"
    ]
  },
  {
    id: "langchain-framework",
    title: "LangChain Framework",
    category: "genai",
    tier: "common",
    summary: "A widely-used framework for composing LLM calls, tools, memory, and retrieval into applications, via reusable chains and agent abstractions.",
    content:
`LangChain's core idea is composability: it provides standard interfaces around LLM providers, prompt templates, output parsers, retrievers, and tools, and lets you chain them together (classically via its LCEL — LangChain Expression Language — pipe syntax) into a pipeline that takes an input and produces a structured output, without hand-writing the plumbing for each provider's API from scratch.

Prompt templates separate the fixed structure of a prompt from the variables filled in at runtime, which keeps prompts maintainable as an application grows past a handful of hardcoded strings. Output parsers coerce a model's raw text response into a structured type (JSON, a Pydantic model, a list) and can trigger automatic retries if the model's output doesn't parse, which matters because raw LLM output is unstructured text by default and downstream code usually needs structured data.

For retrieval-augmented generation, LangChain provides document loaders (PDFs, web pages, databases), text splitters (chunking long documents into retrievable pieces), embedding model wrappers, and a common interface over many vector stores, so swapping the underlying vector database doesn't require rewriting the retrieval logic. Its agent abstractions wrap the ReAct-style reason/act/observe loop plus tool definitions so you don't hand-roll the control flow.

The realistic interview take: LangChain is useful for prototyping and for standardizing across multiple LLM providers, but its abstractions can add debugging overhead and hidden complexity for simple use cases — many production teams eventually write thinner, more direct integrations for performance-critical paths once requirements stabilize, while keeping LangChain (or similar frameworks) for genuinely multi-step, multi-tool orchestration.`,
    keyPoints: [
      "LangChain standardizes interfaces across LLM providers, retrievers, tools, and parsers",
      "LCEL-style chaining composes prompt → model → parser pipelines declaratively",
      "Output parsers coerce free-text LLM responses into structured data, with retry support",
      "Built-in document loaders, text splitters, and a common vector-store interface support RAG",
      "Agent abstractions wrap the reason-act-observe loop and tool-calling machinery",
      "Great for prototyping/multi-provider work; teams often go leaner for performance-critical paths"
    ]
  },
  {
    id: "langsmith-observability",
    title: "LangSmith & LLM Observability",
    category: "genai",
    tier: "common",
    summary: "Tracing, evaluating, and monitoring LLM applications in production — treating prompts and chains as software that needs the same rigor as any pipeline.",
    content:
`LLM applications are notoriously hard to debug from the outside — a bad final answer could stem from a bad retrieval, a truncated prompt, a tool call that failed silently, or the model itself, and without visibility into intermediate steps you're guessing. Observability tools like LangSmith address this by tracing every step of a chain or agent run — each prompt sent, each tool call and its result, each intermediate output, latency, and token cost — so you can inspect exactly what happened for any given request.

Beyond tracing individual runs, these tools support offline evaluation: running a fixed test set of inputs through your pipeline and scoring outputs against reference answers or rubric-based criteria, often using another LLM as a judge for open-ended text where exact-match scoring doesn't apply. This lets you catch regressions when you change a prompt, swap a model, or update a retriever, the same way unit tests catch regressions in conventional code.

In production, observability extends to monitoring: tracking latency, cost per request, error rates, and drift in output quality over time, plus capturing user feedback (thumbs up/down, corrections) to build a dataset for future fine-tuning or prompt iteration. Dataset curation from real production traces — especially the failures — is one of the highest-leverage activities for improving an LLM application over time.

The interview-relevant mindset: treat prompts, chains, and retrieval configs as code that needs versioning, testing, and monitoring, not as one-off strings tuned by hand and shipped without regression coverage.`,
    keyPoints: [
      "Tracing captures every intermediate step of a chain/agent run for debugging",
      "LLM-as-judge evaluation scores open-ended outputs where exact match doesn't apply",
      "Offline eval sets catch regressions when prompts, models, or retrievers change",
      "Production monitoring tracks latency, cost, error rate, and output-quality drift",
      "User feedback and failure traces are high-leverage inputs for iteration",
      "Treat prompts/chains as versioned, tested code, not one-off hand-tuned strings"
    ]
  },
  {
    id: "llm-guardrails-safety",
    title: "LLM Guardrails & Safety",
    category: "genai",
    tier: "common",
    summary: "Layered defenses that keep an LLM application's inputs, outputs, and behavior within acceptable bounds in production.",
    content:
`Guardrails typically operate at three points: input validation (screening user prompts before they reach the model), output validation (screening the model's response before it reaches the user or triggers an action), and behavioral constraints baked into the system prompt or the model's own alignment training. Input-side concerns include prompt injection (a user or a retrieved document trying to override the system's instructions) and jailbreak attempts trying to bypass safety training; output-side concerns include toxic or off-brand content, PII leakage, hallucinated facts, and responses that don't match a required structured format.

Practical techniques include classifier-based content filters (a smaller, fast model or rules engine that flags disallowed categories before/after the main LLM call), structured output validation (schema-checking a JSON response and rejecting or retrying malformed ones), retrieval/tool scoping (never letting a RAG system or agent access data or actions beyond what the current user is authorized for — this is a genuine security boundary, not just a prompt instruction), and rate limiting or cost caps to bound damage from runaway loops.

Prompt injection deserves special attention because instructions and data share the same channel (plain text) in an LLM call — there's no hard boundary the model is guaranteed to respect between "the system's trusted instructions" and "untrusted content the model is reading," which is fundamentally different from, say, SQL where you can parameterize queries to separate code from data. Defense in depth (least-privilege tool access, output monitoring, human approval for high-stakes actions) is currently more reliable than trying to make any single layer bulletproof.

Interviewers want to see that you treat safety as a systems problem with multiple layers, not something a single well-crafted system prompt solves.`,
    keyPoints: [
      "Guardrails apply at input validation, output validation, and behavioral/system-prompt levels",
      "Prompt injection exploits the fact that instructions and data share the same text channel",
      "Structured output validation catches malformed or off-schema responses before they propagate",
      "Least-privilege tool/data scoping is a real security boundary, not just a prompt instruction",
      "Defense in depth beats relying on any single guardrail layer",
      "Safety is a systems problem — rate limits, monitoring, and human review all play a role"
    ]
  },
  {
    id: "llm-inference-optimization",
    title: "LLM Inference Optimization",
    category: "genai",
    tier: "advanced",
    summary: "Techniques for serving LLMs faster and cheaper — quantization, KV caching, batching, and speculative decoding — which matter as much as model quality in production.",
    content:
`Autoregressive generation is inherently sequential — each new token depends on all previous ones — which makes naive inference slow, since the model would otherwise recompute attention over the entire growing sequence at every step. KV (key-value) caching fixes the redundant part: the key and value projections for already-generated tokens are cached and reused, so each new token only requires computing attention for the new query against the cached keys/values, turning an O(n²) per-sequence cost into effectively O(n) incremental work at the cost of memory to store the cache.

Quantization reduces the numerical precision of model weights (and sometimes activations) from 16-bit or 32-bit floats down to 8-bit or 4-bit integers, shrinking memory footprint and often speeding up compute-bound and memory-bound operations, at some accuracy cost that's usually small if done carefully (e.g. with calibration or quantization-aware techniques). This is often the difference between a model fitting on a single GPU or not.

Batching multiple requests together improves GPU utilization since a lot of inference is memory-bandwidth-bound rather than compute-bound, but naive batching wastes compute on requests that finish early; continuous batching (dynamically adding new requests into a batch as slots free up, used by serving engines like vLLM) keeps utilization high without waiting for a whole batch to complete together.

Speculative decoding uses a small, fast draft model to propose several tokens ahead, which the large target model then verifies in parallel in a single forward pass, accepting correct guesses and only falling back to normal generation on a mismatch — this can meaningfully speed up generation since verification is cheaper than sequential generation, without changing the target model's output distribution.`,
    keyPoints: [
      "KV caching avoids recomputing attention over past tokens, making generation roughly linear per new token",
      "Quantization (e.g. 8-bit/4-bit) shrinks memory and often speeds inference at modest accuracy cost",
      "Continuous batching keeps GPU utilization high by dynamically filling freed batch slots",
      "Speculative decoding uses a small draft model plus parallel verification to speed up generation",
      "Most LLM inference is memory-bandwidth-bound, which is why batching and caching matter so much",
      "Serving-level optimization is often as important as model-level quality for production cost/latency"
    ]
  },
  {
    id: "peft-lora-qlora",
    title: "PEFT: LoRA & QLoRA",
    category: "genai",
    tier: "core",
    summary: "Parameter-efficient fine-tuning methods that adapt large pretrained models by training a small number of extra parameters instead of the full weight set.",
    content:
`Full fine-tuning updates every parameter of a pretrained model, which for a multi-billion parameter LLM requires storing full gradients and optimizer states for every weight — often 3-4x the model's own memory footprint — making it expensive and, for many teams, simply infeasible on available hardware. Parameter-efficient fine-tuning (PEFT) methods instead freeze the pretrained weights and train a much smaller set of additional parameters, dramatically cutting memory and storage cost while retaining most of full fine-tuning's benefit for a given task.

LoRA (Low-Rank Adaptation) is the dominant PEFT technique: instead of updating a weight matrix W directly, it freezes W and learns a low-rank decomposition delta-W = A·B, where A and B are much smaller matrices whose rank r is a tunable hyperparameter (typically single or low double digits). At inference, A·B can be merged back into W with no added latency, or kept separate to swap between multiple task-specific adapters on top of the same frozen base model — useful for serving many fine-tuned variants without duplicating the full model per task.

QLoRA extends this further by quantizing the frozen base model to 4-bit precision (using a specialized data type, NF4, designed to match the distribution of neural network weights) while still training the LoRA adapters in higher precision, which cuts memory enough to fine-tune very large models on a single consumer or prosumer GPU. This makes QLoRA the practical default for teams without large training clusters.

Interview-relevant tradeoff: PEFT methods train a tiny fraction of parameters (often under 1%), so they're far cheaper and less prone to catastrophic forgetting of the base model's general capabilities than full fine-tuning, though for very large domain shifts full fine-tuning can still edge out PEFT in final task performance.`,
    keyPoints: [
      "Full fine-tuning needs gradients/optimizer state for every parameter — expensive at LLM scale",
      "PEFT freezes the base model and trains a small set of added parameters instead",
      "LoRA learns a low-rank delta-W = A·B on top of frozen weights, adjustable via rank r",
      "LoRA adapters can be merged for zero extra latency or swapped to serve multiple tasks cheaply",
      "QLoRA quantizes the frozen base to 4-bit (NF4) so large models fit on one GPU for fine-tuning",
      "PEFT trains <1% of parameters, is cheaper and less prone to catastrophic forgetting than full fine-tuning"
    ]
  },
  {
    id: "prompt-engineering",
    title: "Prompt Engineering",
    category: "genai",
    tier: "core",
    summary: "The practice of designing inputs that reliably steer an LLM's output — a genuine engineering discipline with reusable patterns, not just trial and error.",
    content:
`A well-structured prompt typically separates role/context (who the model should act as, and what background it needs), task instructions (what to actually do, stated unambiguously), constraints (format, length, tone, things to avoid), and, where helpful, examples. Zero-shot prompting relies purely on instructions; few-shot prompting includes a small number of worked input-output examples directly in the prompt, which is often the single highest-leverage lever for getting consistent formatting and style out of a model without any fine-tuning.

Being explicit about output format (e.g. "respond with valid JSON matching this schema") measurably reduces parsing failures downstream, and specifying what the model should do when it doesn't know an answer (e.g. "say you're unsure rather than guessing") measurably reduces confident hallucination on out-of-scope questions. Chain-of-thought style instructions ("explain your reasoning before giving a final answer") improve accuracy on multi-step problems by giving the model room to work through the problem rather than pattern-matching straight to an answer.

System prompts (persistent instructions set by the application rather than the end user) establish the model's persona, guardrails, and default behavior across a whole conversation, and should be treated as a place for the application's stable requirements — not for content that changes per-request, which belongs in the user or a dedicated context section.

Prompt engineering is inherently iterative and model-specific: a prompt tuned for one model's quirks doesn't always transfer cleanly to another, which is why systematic prompt evaluation (a fixed test set, scored consistently) rather than ad hoc "it looks better to me" tweaking is what separates rigorous prompt engineering from guesswork.`,
    keyPoints: [
      "Structure prompts around role/context, task, constraints, and (often) examples",
      "Few-shot examples are usually the highest-leverage lever for consistent format/style",
      "Explicit output-format instructions materially reduce downstream parsing failures",
      "Telling the model how to handle uncertainty reduces confident hallucination",
      "System prompts hold stable, application-level instructions, not per-request content",
      "Prompts are model-specific and should be evaluated systematically against a fixed test set"
    ]
  },
  {
    id: "rag-architecture",
    title: "RAG Architecture",
    category: "genai",
    tier: "core",
    summary: "Retrieval-augmented generation grounds an LLM's answers in retrieved documents rather than relying solely on what it memorized during training.",
    content:
`A RAG pipeline has an indexing phase and a query phase. Indexing chunks source documents into retrievable pieces (chunk size is a real tradeoff: too large wastes context and dilutes relevance, too small loses surrounding context needed to interpret a passage correctly), embeds each chunk into a vector using an embedding model, and stores the vectors in a vector database alongside metadata for filtering. At query time, the user's question is embedded with the same model, the vector store returns the top-k most similar chunks (typically via cosine similarity or approximate nearest-neighbor search), and those chunks are inserted into the LLM's prompt as grounding context alongside the original question.

Retrieval quality is usually the actual bottleneck in a mediocre RAG system, not the LLM — if the right chunk never gets retrieved, no amount of prompting fixes the resulting answer. Common improvements include hybrid search (combining dense vector similarity with sparse keyword search like BM25, since pure semantic search can miss exact-match terms like product codes or names), re-ranking (retrieving a larger candidate set cheaply, then using a more expensive cross-encoder model to re-score and reorder the top candidates for precision), and query rewriting or expansion (transforming a vague user query into one or more better-formed search queries before retrieval).

Chunk overlap (letting adjacent chunks share some text) helps avoid losing context right at a chunk boundary, and attaching metadata (source, date, section) enables filtered retrieval and, importantly, lets the final answer cite its sources.

Interviewers often probe failure modes: retrieving irrelevant chunks that distract the model, retrieving stale/conflicting information, and the model ignoring retrieved context and answering from parametric memory anyway despite it being wrong or outdated.`,
    keyPoints: [
      "RAG has an indexing phase (chunk, embed, store) and a query phase (embed, retrieve, generate)",
      "Chunk size is a real tradeoff between context dilution and losing surrounding meaning",
      "Retrieval quality is usually the actual bottleneck, not the generation model",
      "Hybrid search (dense + BM25) catches exact-match terms pure semantic search misses",
      "Re-ranking with a cross-encoder improves precision on top of cheap initial retrieval",
      "Metadata enables filtered retrieval and source citation in the final answer"
    ]
  },
  {
    id: "vector-databases",
    title: "Vector Databases",
    category: "genai",
    tier: "common",
    summary: "Specialized data stores for high-dimensional embeddings, optimized for fast approximate similarity search at scale — the retrieval backbone of RAG.",
    content:
`A vector database stores embeddings (dense numeric vectors produced by an embedding model) and answers nearest-neighbor queries: given a query vector, return the k stored vectors most similar to it, typically by cosine similarity, dot product, or Euclidean distance. Exact nearest-neighbor search requires comparing the query against every stored vector, which is fine for thousands of vectors but doesn't scale to millions — so production vector databases use approximate nearest neighbor (ANN) algorithms that trade a small amount of recall for large speedups.

HNSW (hierarchical navigable small world graphs) is the most common ANN algorithm in practice: it builds a multi-layer graph where each layer is a progressively sparser "skip list"-like structure over the vectors, letting search start at a coarse layer and descend to more precise layers, achieving logarithmic-ish search time with high recall. IVF (inverted file index) instead clusters vectors ahead of time and only searches within the clusters nearest the query, trading some accuracy for lower memory and faster indexing than HNSW at very large scale.

Beyond raw similarity search, production vector databases support metadata filtering (restricting search to vectors matching structured conditions, like "only documents from this tenant" or "only from the last 90 days"), which matters enormously for multi-tenant RAG applications and needs to be efficient jointly with the vector search, not as a slow post-filter step. Options range from dedicated vector databases (Pinecone, Weaviate, Qdrant, Milvus) to vector-search extensions bolted onto existing databases (pgvector for Postgres, Elasticsearch/OpenSearch's vector fields) — the right choice often depends more on existing infrastructure and operational familiarity than on raw benchmark numbers.

Interview-relevant point: embedding model and vector database are decoupled choices — swapping embedding models generally requires re-embedding and re-indexing your entire corpus, since vectors from different models aren't comparable.`,
    keyPoints: [
      "Vector DBs answer nearest-neighbor queries over embeddings using cosine/dot/Euclidean distance",
      "ANN algorithms (HNSW, IVF) trade a little recall for large speedups at scale",
      "HNSW uses a multi-layer graph; IVF clusters vectors and searches nearest clusters only",
      "Efficient metadata filtering combined with vector search matters for multi-tenant RAG",
      "Choices range from dedicated vector DBs to vector extensions on existing databases (pgvector)",
      "Changing embedding models requires re-embedding and re-indexing the whole corpus"
    ]
  },
  {
    id: "transformer-basics",
    title: "Transformer Basics",
    category: "genai",
    tier: "core",
    summary: "The core idea behind every modern LLM: turn text into vectors, let each token look at every other token via self-attention, and stack that many times.",
    content:
`Text first gets tokenized into subword units and mapped to learned embedding vectors. Since attention itself has no sense of order, a positional encoding (learned or sinusoidal, or relative-position schemes like RoPE in most current LLMs) is added so the model knows token 3 comes before token 7.

Self-attention is the mechanism that makes transformers work: for every token, the model computes a query, key, and value vector, scores the query against every other token's key to get attention weights (via scaled dot-product + softmax), and uses those weights to blend the value vectors into a new representation for that token. In plain terms — each token asks "which other tokens are relevant to me right now?" and pulls information from them, all in parallel, which is what makes transformers so much more parallelizable to train than RNNs that had to process tokens one at a time.

Multi-head attention runs several of these attention computations in parallel with different learned projections, so different heads can specialize (one might track syntactic dependencies, another coreference, another local word order). Each transformer block stacks multi-head attention with a position-wise feedforward network, wrapped in residual connections and layer normalization — residuals are what make it practical to stack dozens of these blocks without gradients vanishing.

For generative LLMs specifically (GPT-style, decoder-only), attention is causally masked so a token can only attend to earlier tokens, never future ones — this is what makes autoregressive, left-to-right generation possible: the model predicts the next token, appends it, and repeats. This is distinct from the original encoder-decoder transformer (used for translation) and encoder-only models like BERT, which attend bidirectionally and are suited to understanding tasks rather than open-ended generation.`,
    keyPoints: [
      "Tokens → embeddings → add positional information (order isn't implicit in attention)",
      "Self-attention: each token builds a query, compares to every key, blends values by attention weight",
      "Multi-head attention lets different heads specialize in different relationships",
      "Residual connections + layer norm are what make stacking dozens of blocks trainable",
      "Decoder-only LLMs use causal masking so generation stays strictly left-to-right",
      "Encoder-only (BERT) vs decoder-only (GPT) vs encoder-decoder differ in attention masking and task fit"
    ]
  },
  {
    id: "vllm",
    title: "vLLM",
    category: "genai",
    tier: "common",
    summary: "An open-source, high-throughput LLM inference and serving engine built around PagedAttention — the de facto standard for self-hosting LLMs efficiently.",
    content:
`Naive LLM serving wastes enormous amounts of GPU memory: each request's KV cache (the cached key/value attention tensors that let generation avoid recomputing attention over already-generated tokens) is typically allocated as one large contiguous block sized for the worst case, so memory gets fragmented and over-reserved, capping how many requests can run concurrently.

vLLM's core contribution is PagedAttention, which borrows the idea of virtual memory paging from operating systems: instead of one contiguous KV cache block per request, the cache is split into fixed-size blocks that can live anywhere in GPU memory, with a lightweight block table mapping logical positions to physical blocks per request. This nearly eliminates fragmentation and enables memory sharing — for example, requests that share a prompt prefix (common in few-shot prompting or repeated system prompts) can literally share the same physical blocks instead of duplicating them.

On top of that, vLLM uses continuous batching (also called in-flight batching): rather than waiting for an entire fixed batch to finish generating before starting new requests, finished sequences are evicted and new ones inserted into the batch every iteration, keeping GPU utilization high instead of leaving it idle waiting on the slowest sequence in a static batch.

Practically, vLLM exposes an OpenAI-compatible API server, so it's often a drop-in replacement for hitting a hosted API when self-hosting open-weight models, and it supports tensor parallelism for splitting a model too large for one GPU across several. The interview-relevant tradeoff: vLLM optimizes for throughput (tokens/sec across many concurrent requests) more than single-request latency — for a single user waiting on one response, a simpler server can look competitive, but vLLM pulls ahead fast as concurrent request volume grows.`,
    keyPoints: [
      "PagedAttention splits the KV cache into fixed-size, non-contiguous blocks, like OS virtual memory paging",
      "This eliminates memory fragmentation and enables sharing cached blocks across requests with a common prefix",
      "Continuous batching swaps finished/new sequences into the batch every iteration instead of waiting for a fixed batch to drain",
      "Ships an OpenAI-compatible API, making it a common drop-in for self-hosted open-weight models",
      "Supports tensor parallelism to serve models too large for a single GPU",
      "Optimized primarily for throughput under concurrent load, not single-request latency"
    ]
  },

  // ============================= ML SYSTEM DESIGN =============================
  {
    id: "data-infrastructure-ml",
    title: "Data Infrastructure for ML",
    category: "sysdesign",
    tier: "common",
    summary: "The storage, processing, and pipeline layers that get raw data into a form ML training and serving can actually use, reliably and at scale.",
    content:
`Most ML systems draw from a mix of storage layers: a data lake (raw, often semi-structured data stored cheaply, e.g. in object storage like S3, schema-on-read) and a data warehouse (curated, structured, schema-on-write data optimized for analytical queries, e.g. Snowflake/BigQuery). The lakehouse pattern (e.g. Delta Lake, Iceberg) tries to combine both — cheap object storage underneath with transactional guarantees and schema enforcement on top — which has become increasingly common because it avoids duplicating data between a lake and a warehouse.

Batch processing (Spark, or SQL-based transformations via a tool like dbt) handles large-volume, non-time-sensitive transformations on a schedule, while stream processing (Kafka plus a stream processor like Flink or Spark Structured Streaming) handles continuously arriving data where low latency matters — think real-time fraud features or live recommendation signals. Many production systems run a Lambda or Kappa architecture to reconcile both: batch for accurate, complete historical views, streaming for low-latency freshness, converging on the same underlying data model.

Data quality infrastructure — schema validation, freshness checks, null/range/distribution checks (tools like Great Expectations or dbt tests) — matters disproportionately for ML because silent data quality issues degrade model performance gradually and often invisibly, unlike a hard pipeline failure that at least pages someone. Data lineage tracking (knowing which upstream tables/events feed which downstream features and models) is what makes debugging a sudden metric drop or complying with a data deletion request tractable in a system with many interdependent pipelines.

Interview framing: be ready to reason about batch vs. streaming tradeoffs for a given feature's latency requirement, and to name where data quality checks should sit in a pipeline (as close to the source as possible, so bad data doesn't propagate downstream).`,
    keyPoints: [
      "Data lakes are cheap/schema-on-read; warehouses are structured/schema-on-write; lakehouses blend both",
      "Batch processing suits large, non-urgent transforms; streaming suits low-latency, continuous data",
      "Lambda/Kappa architectures reconcile batch accuracy with streaming freshness",
      "Data quality checks (schema, freshness, distribution) should sit as close to the source as possible",
      "Data lineage tracking is essential for debugging and for data-deletion/compliance requests",
      "Choose batch vs. streaming based on the actual latency requirement of the downstream feature"
    ]
  },
  {
    id: "drift-monitoring",
    title: "Data & Model Drift Monitoring",
    category: "sysdesign",
    tier: "core",
    summary: "Detecting when the statistical properties of production data or a model's performance shift away from what it was trained and validated on.",
    content:
`Data drift (also called covariate shift) is when the distribution of input features in production diverges from the training distribution, even if the true relationship between features and target hasn't changed — a payments model trained pre-pandemic seeing wildly different transaction patterns post-pandemic is a classic example. Concept drift is a more fundamental shift: the actual relationship between inputs and the target changes, so even the same input distribution now maps to different outcomes (fraud patterns evolve specifically because fraudsters adapt to whatever the current model catches).

Detecting drift usually means comparing a reference distribution (training data, or a recent stable production window) against a current window, using statistical tests — population stability index (PSI) and KL/JS divergence for comparing distributions, Kolmogorov-Smirnov tests for individual numeric features, and chi-squared tests for categorical ones. These are typically computed per-feature and monitored on a schedule, with alerting thresholds tuned to avoid both alert fatigue from noisy small drifts and missing genuinely important shifts.

The harder, more direct signal is performance drift — tracking the model's actual accuracy/precision/recall/etc. over time — but this requires ground-truth labels, which are often delayed (you don't know if a loan defaulted for months) or entirely unavailable in production for some tasks. When labels are delayed or missing, proxy metrics (prediction distribution shift, confidence score distribution, feature drift as a leading indicator) fill the gap until real labels arrive.

The practical response to detected drift ranges from alerting a human to review, to automated retraining pipelines triggered past a drift threshold — but automated retraining needs its own safeguards (holdout evaluation before promotion, gradual rollout) so a retrain doesn't silently ship a worse model in response to a data quality issue rather than genuine drift.`,
    keyPoints: [
      "Data/covariate drift: input distribution shifts even if the input-target relationship holds",
      "Concept drift: the input-target relationship itself changes over time",
      "PSI, KL/JS divergence, and KS tests are standard tools for detecting distribution shift",
      "Performance drift is the most direct signal but needs (often delayed) ground-truth labels",
      "Proxy metrics fill the gap when labels are delayed or unavailable",
      "Automated retraining triggered by drift needs its own evaluation gate before promotion"
    ]
  },
  {
    id: "deployment-patterns",
    title: "Deployment Patterns: Blue-Green, Canary, Shadow",
    category: "sysdesign",
    tier: "core",
    summary: "Strategies for rolling out a new model or service version safely, controlling exactly how much production traffic sees it before a full commit.",
    content:
`Blue-green deployment keeps two full, identical production environments — one (blue) currently live, one (green) running the new version — and cuts traffic over from blue to green all at once (often via a load balancer or DNS switch) once the new version is validated. If something's wrong, rollback is just switching traffic back to blue, which is fast and low-risk, but the approach doubles infrastructure cost while both environments exist and gives you no gradual signal before the full cutover.

Canary deployment instead routes a small percentage of real traffic (say 5%) to the new version while the rest continues to the old one, gradually increasing the new version's share as monitoring confirms it's healthy. This catches real production issues — the ones that don't show up in staging — while limiting the blast radius of a bad new version to a small slice of users, at the cost of running and monitoring two versions simultaneously for longer, and needing traffic-splitting infrastructure and clear rollback criteria defined up front.

Shadow deployment (also called dark launch) sends a copy of real production traffic to the new model without using its output at all — the old model's response is still what's returned to users, while the new model's predictions are logged and compared offline. This is the lowest-risk way to validate a new model's real-world behavior (including latency and failure rate) against genuine production traffic, since it structurally cannot affect what users see, but it requires infrastructure to duplicate traffic and it can't validate anything about actual user reaction to the new outputs (e.g. click-through, conversion) since users never see them.

Interview framing: canary is the default for anything where you need to observe real user-outcome metrics; shadow is the default when you need to validate technical behavior (latency, errors, prediction distribution) with zero user risk before even considering a canary.`,
    keyPoints: [
      "Blue-green: instant full cutover between two live environments, fast rollback, no gradual signal",
      "Canary: small traffic percentage to the new version, gradually increased, limits blast radius",
      "Shadow: new model sees real traffic but its output is never shown to users — zero user risk",
      "Shadow validates technical behavior (latency, errors) but not real user-outcome metrics",
      "Canary is needed to observe actual business/user-outcome metrics before full rollout",
      "Define rollback criteria and monitoring thresholds before starting any of these rollouts"
    ]
  },
  {
    id: "docker-for-mlops",
    title: "Docker for MLOps",
    category: "sysdesign",
    tier: "common",
    summary: "Containerization solves ML's notorious environment-reproducibility problem by packaging code, dependencies, and runtime together into a portable unit.",
    content:
`ML projects are especially prone to "works on my machine" failures because of heavy, version-sensitive dependency stacks (specific CUDA/cuDNN versions matched to a specific PyTorch/TensorFlow build, particular versions of numpy/pandas/scikit-learn that can silently change numerical results) — a training script that worked last month can produce different results today after an innocuous pip install --upgrade. Docker addresses this by packaging the application code, its exact dependency versions, and much of the runtime environment into an image that runs identically across a laptop, a CI runner, and a production cluster.

A typical ML Dockerfile starts from a base image (often a CUDA-enabled base for GPU workloads), installs pinned dependencies (a lockfile, not just loose version ranges, so a rebuild months later doesn't silently pull different package versions), copies in code and possibly model artifacts, and defines an entrypoint (a training script, or a serving process like a Flask/FastAPI app wrapping model inference). Multi-stage builds keep final images smaller by separating a heavier build stage (compiling dependencies) from a leaner runtime stage that only needs the built artifacts.

For serving specifically, containerizing the inference endpoint means the exact same artifact that passed testing is what gets deployed — no "we rebuilt it slightly differently in prod" drift — and makes horizontal scaling straightforward since a container orchestrator can spin up identical replicas on demand.

Practical gotchas interviewers probe: GPU images are large (multi-GB) and slow to build/pull, so caching layers effectively (ordering Dockerfile instructions so rarely-changing layers like dependency installs come before frequently-changing layers like application code) matters for iteration speed; and image size/security (not shipping unnecessary build tools or credentials in the final image) matters for production hygiene.`,
    keyPoints: [
      "Docker fixes ML's dependency-reproducibility problem by packaging code + exact dependencies + runtime",
      "Pin dependency versions with a lockfile, not loose ranges, for reproducible rebuilds",
      "Multi-stage builds keep runtime images lean by separating build and runtime stages",
      "Containerized serving guarantees the tested artifact is exactly what's deployed",
      "Order Dockerfile layers so slow-changing steps (deps) come before fast-changing ones (code)",
      "GPU images are large — layer caching and minimizing final image size both matter in practice"
    ]
  },
  {
    id: "feature-stores",
    title: "Feature Stores",
    category: "sysdesign",
    tier: "core",
    summary: "A centralized system for computing, storing, and serving ML features consistently between offline training and low-latency online inference.",
    content:
`The core problem a feature store solves is training-serving skew: if the feature-computation logic used to build a training set (often a batch SQL/Spark job over historical data) diverges even slightly from the logic used to compute the same feature at real-time inference (often a different codepath, sometimes a different language or team entirely), the model sees systematically different inputs in production than it did in training — a frequent, hard-to-detect source of degraded production performance that doesn't show up in offline evaluation at all.

A feature store addresses this with a dual-store architecture: an offline store (typically a data warehouse or data lake, optimized for large batch reads) holds historical feature values for training and batch scoring, and an online store (typically a low-latency key-value store like Redis or DynamoDB) holds the latest feature values for real-time serving, with both populated from the same underlying feature definitions and transformation logic — so training and serving are guaranteed to compute a feature the same way.

Point-in-time correctness is a related, easy-to-get-wrong requirement: when building a training set, each row must be joined against feature values as they existed at that row's timestamp, not the latest values — using today's feature values to train on last year's labels leaks future information into the model and produces a training set that overstates real-world performance.

A feature store also enables feature reuse and discovery across teams (avoiding every team recomputing the same "user's 30-day purchase count" feature slightly differently) and versioning of feature definitions, which matters for reproducing why a model behaved a certain way at a given point in time.`,
    keyPoints: [
      "Feature stores primarily solve training-serving skew from divergent offline/online feature logic",
      "Dual-store architecture: offline store for training/batch, online low-latency store for real-time serving",
      "Both stores share the same feature definitions, guaranteeing consistent computation",
      "Point-in-time correctness prevents future information from leaking into training data",
      "Feature stores enable cross-team feature reuse instead of duplicated, inconsistent recomputation",
      "Feature versioning supports reproducing and debugging past model behavior"
    ]
  },
  {
    id: "kubernetes-for-ml",
    title: "Kubernetes for ML",
    category: "sysdesign",
    tier: "advanced",
    summary: "How Kubernetes' scheduling, scaling, and resource-management primitives get applied to the specific demands of ML training and serving workloads.",
    content:
`Kubernetes orchestrates containers across a cluster of machines, and for ML workloads its core value is scheduling heterogeneous resource requests (CPU-only preprocessing jobs alongside GPU-hungry training jobs) efficiently across shared infrastructure, and automatically restarting/rescheduling failed pods, which matters a lot for long-running training jobs that would otherwise need manual babysitting. GPU support requires the NVIDIA device plugin so the scheduler is aware of GPU resources and can allocate them, and jobs typically request a specific GPU count/type as a resource limit, similar to how CPU/memory requests work.

For serving, a Kubernetes 'Deployment' manages a set of replica pods running the model-serving container, and a 'HorizontalPodAutoscaler' can scale the replica count based on metrics like CPU utilization, request rate, or (with custom metrics) queue depth — important for ML serving workloads with bursty traffic, where the GPU/inference cost of over-provisioning constantly is high. Readiness and liveness probes let Kubernetes know when a pod is actually ready to serve traffic (important for models with slow cold-start/loading time) versus when it should be restarted for being unhealthy.

For training, Kubernetes 'Jobs' (run-to-completion, as opposed to long-running 'Deployments') fit better, and ML-specific extensions like Kubeflow or the Volcano/Kueue batch schedulers add ML-aware features Kubernetes doesn't have natively: gang scheduling (start all workers of a distributed training job together or not at all, since a partially-started distributed job wastes resources and can deadlock), queueing when a cluster is fully utilized, and multi-step pipeline orchestration.

Interview-relevant framing: Kubernetes gives infrastructure-level portability and resource efficiency, but ML-specific concerns (GPU scheduling, gang scheduling, expensive cold starts, spot-instance interruption handling for cost savings) usually require ML-aware tooling layered on top of vanilla Kubernetes, not vanilla Kubernetes alone.`,
    keyPoints: [
      "Kubernetes schedules and restarts containers across shared CPU/GPU infrastructure",
      "GPU scheduling needs the NVIDIA device plugin; GPUs are requested as a resource limit",
      "HorizontalPodAutoscaler scales serving replicas based on load, key for bursty inference traffic",
      "Readiness/liveness probes matter especially for models with slow cold-start loading",
      "Kubernetes Jobs suit run-to-completion training; Deployments suit long-running serving",
      "Distributed training needs gang scheduling and ML-aware tooling (Kubeflow, Kueue) on top of vanilla k8s"
    ]
  },
  {
    id: "ml-system-design-framework",
    title: "ML System Design Interview Framework",
    category: "sysdesign",
    tier: "core",
    summary: "A repeatable structure for tackling open-ended ML system design questions under interview time pressure, from requirements to tradeoffs.",
    content:
`Start by clarifying requirements before proposing anything: what's the actual business goal (not just "build a recommender," but what does the business want to move — engagement, revenue, retention), what scale are we talking about (users, requests per second, data volume), what are the latency requirements (a search ranking system serving in under 100ms is a very different problem than an overnight batch scoring job), and what's explicitly out of scope. Skipping this step is the single most common way candidates lose points — jumping straight to architecture on an under-specified problem signals inexperience, not confidence.

Next, frame the ML problem: what's actually being predicted, what would training data look like and where does it come from, what's a reasonable label definition (this is often surprisingly non-trivial — e.g. what counts as a "successful" recommendation), and what offline metric will proxy for the real business goal during development.

Then walk through the system end to end: data collection and feature pipeline, training pipeline (including how often to retrain and why), serving architecture (batch precomputation vs. real-time inference, and the latency/freshness tradeoff between them), and the monitoring/feedback loop that closes back to retraining. For each major component, state at least one real tradeoff and your reasoning for the choice — interviewers are evaluating your judgment under ambiguity, not fishing for one "correct" architecture.

Finally, discuss evaluation: what offline metrics you'd track, why they're a reasonable proxy for the true business metric (and where that proxy might mislead you), and how you'd validate real-world impact via online A/B testing before a full rollout. Budget your time deliberately — many candidates over-invest in the data pipeline and run out of time before reaching evaluation and monitoring, which are just as heavily weighted.`,
    keyPoints: [
      "Always clarify business goal, scale, and latency requirements before proposing architecture",
      "Explicitly frame the ML problem: prediction target, label definition, training data source",
      "Walk the full pipeline: data → features → training → serving → monitoring/feedback loop",
      "State a concrete tradeoff and your reasoning at each major design decision",
      "Offline metrics are a proxy for the business goal — name where that proxy could mislead",
      "Budget interview time across the whole pipeline; don't over-invest in just the data layer"
    ]
  },
  {
    id: "ml-monitoring-observability",
    title: "ML Monitoring & Observability",
    category: "sysdesign",
    tier: "core",
    summary: "The layered set of signals — infrastructure, data, model, and business metrics — needed to know an ML system is actually working in production.",
    content:
`ML systems need monitoring at several distinct layers, and conflating them is a common mistake: infrastructure metrics (latency, throughput, error rate, resource utilization) tell you the service is technically up and responsive, but a model can be serving fast, error-free, completely wrong predictions and these metrics won't show it at all. Data quality metrics (missing values, schema violations, out-of-range values, drift versus training distribution) catch input problems before they silently degrade output quality.

Model performance metrics (accuracy, precision/recall, calibration, or a proxy when ground truth is delayed) are the most direct signal of whether the model is actually doing its job, but often lag behind other signals significantly since real labels can take days, weeks, or months to arrive depending on the task. Business/outcome metrics (conversion rate, revenue impact, user engagement) are ultimately what matters but are the most delayed and the most confounded by factors outside the model's control, so they need to be interpreted alongside, not instead of, the more immediate technical signals.

Effective monitoring combines all four layers with alerting tuned to avoid both alert fatigue (too many low-value alerts trains people to ignore them) and missed incidents (thresholds set so loose that real problems slip through) — and distinguishes alerts that need immediate human response from dashboards meant for periodic review. Logging individual prediction requests (inputs, outputs, model version, latency) at a sustainable sampling rate is what makes root-causing a specific bad prediction or reproducing a reported issue tractable after the fact, rather than purely statistical monitoring which tells you something's wrong but not concretely why.

Interview framing: be ready to name which layer a given symptom would show up in first, and to explain why relying on business metrics alone is too slow to catch most production ML failures before real damage is done.`,
    keyPoints: [
      "Infrastructure metrics show the service is up — they say nothing about prediction quality",
      "Data quality and drift metrics catch input problems before they degrade model output",
      "Model performance metrics are the most direct signal but often lag behind due to delayed labels",
      "Business metrics matter most but are slowest and most confounded by external factors",
      "Alert thresholds must balance alert fatigue against missing real incidents",
      "Sampled prediction logging enables root-causing specific bad predictions after the fact"
    ]
  },
  {
    id: "ml-pipelines-orchestration",
    title: "ML Pipelines & Orchestration",
    category: "sysdesign",
    tier: "common",
    summary: "Coordinating the multi-step, dependency-ordered workflow — from data ingestion through training to deployment — reliably and repeatably.",
    content:
`An ML pipeline is a directed acyclic graph (DAG) of steps — data extraction, validation, feature computation, training, evaluation, and deployment — where each step depends on the successful completion of specific upstream steps, and orchestration tools (Airflow, Dagster, Kubeflow Pipelines, Prefect) exist to define, schedule, retry, and monitor this graph reliably instead of relying on cron jobs and hope.

Orchestrators provide a few things manual scripting doesn't scale to: dependency management (step B only runs after step A succeeds, and doesn't silently run on stale or partial upstream data), retry logic with backoff for transient failures (a flaky network call shouldn't fail an entire multi-hour pipeline), scheduling (time-based or event-triggered runs), and observability into which step failed and why, with logs and lineage per run. Idempotency is a key design property to build into each step — a step that's safely re-runnable without side effects (e.g. it overwrites/upserts its output rather than appending, avoiding duplicated data on a retry) is what makes retry logic actually safe to use.

Training pipelines specifically benefit from being parameterized and versioned end to end: the code version, data version, and hyperparameters used for a given training run should all be captured together (often via experiment tracking tools like MLflow or Weights & Biases) so that any past model is reproducible and any performance regression can be traced to a specific change in one of those three inputs.

A common architectural question is batch vs. continuous/streaming pipelines: most training pipelines run on a schedule (nightly, weekly) since retraining doesn't usually need to happen the instant new data arrives, while feature computation for real-time serving may need a streaming pipeline — these can and often do coexist within the same overall system, serving different latency needs.`,
    keyPoints: [
      "ML pipelines are DAGs of dependent steps; orchestrators manage scheduling, retries, and monitoring over that graph",
      "Idempotent steps (safe to re-run, e.g. via upsert not append) are what make retries actually safe",
      "Orchestrators give dependency management and per-run observability that ad hoc scripting doesn't scale to",
      "Capture code version + data version + hyperparameters together for reproducibility",
      "Experiment tracking tools (MLflow, W&B) tie training runs back to their exact inputs",
      "Batch training pipelines and streaming feature pipelines often coexist for different latency needs"
    ]
  },
  {
    id: "ml-testing-strategies",
    title: "ML Testing Strategies",
    category: "sysdesign",
    tier: "common",
    summary: "Testing ML systems goes beyond unit tests on code — it needs to validate data, the training process, and model behavior, since bugs can be silent.",
    content:
`Traditional software tests check that code behaves correctly given fixed inputs; ML systems need that plus tests for things that can be "wrong" without any code bug at all — a perfectly correct training script can still produce a bad model if the underlying data quietly changed. Data validation tests (schema checks, range/null checks, distribution checks against an expected baseline) belong at the top of the pipeline, catching bad data before it reaches training or serving, since garbage data produces a model that looks fine in code review and still fails silently in production.

Unit tests still matter for the actual code — feature transformation logic, data preprocessing functions, custom loss functions — the same way they matter in any codebase, and are especially valuable for pinning down edge cases (empty input, single-class batches, extreme values) that are easy to mishandle. Model-level tests go further: behavioral/invariance tests check that a model's predictions respond sensibly to controlled input perturbations (e.g. a sentiment model's prediction shouldn't flip when you swap a demographic term that's irrelevant to sentiment — a fairness/robustness check as much as a correctness one), and directional expectation tests check that a specific known input change moves the prediction in the expected direction (e.g. increasing a "days since last purchase" feature should decrease a purchase-likelihood prediction, all else equal).

Regression tests compare a new model version's predictions against the previous version's on a fixed evaluation set, flagging cases where the new model performs meaningfully worse on specific known-important slices, not just in aggregate — aggregate metrics can look fine even when a model regresses badly on a critical subgroup. Integration tests validate the full pipeline end to end (does the deployed serving endpoint actually return correct-shaped, sane predictions for real-looking requests), which is what catches the class of bugs that only show up when components are wired together, not in any component individually.

Testing strategy should be layered — catching what's cheap to catch early (data/unit tests) before what's expensive to catch late (a bad model discovered via an online A/B test).`,
    keyPoints: [
      "Data validation tests catch quietly-bad input data before it reaches training or serving",
      "Unit tests still cover feature/preprocessing code and its edge cases directly",
      "Invariance and directional expectation tests check model behavior, not just accuracy",
      "Regression tests must check important subgroup slices, not just aggregate metrics",
      "Integration tests catch bugs that only appear when components are wired together end to end",
      "Layer tests so cheap-to-catch issues (data) are caught before expensive-to-catch ones (a live A/B test)"
    ]
  },
  {
    id: "advanced-mlops-practices",
    title: "Advanced MLOps Practices",
    category: "sysdesign",
    tier: "advanced",
    summary: "The practices that separate a one-off ML model from a reliably operated ML system: CI/CD for models, reproducibility, and governance at scale.",
    content:
`CI/CD for ML extends conventional software CI/CD with ML-specific stages: alongside code linting and unit tests, a pipeline should validate data quality on new training data, retrain or fine-tune the model, run an automated evaluation suite (including sliced/subgroup metrics, not just aggregate), and gate promotion to production on that evaluation passing defined thresholds — turning "is this new model actually better" into an automated, repeatable check rather than a judgment call made ad hoc each time.

Reproducibility requires versioning three things together, not just code: the exact training data (or a pointer to an immutable snapshot of it), the code/config used to train, and the resulting model artifact with its metadata (metrics, training data version, hyperparameters, git commit) — a model registry (MLflow Model Registry, or similar) is the standard place to track this lineage and the promotion status of each model version (staging, production, archived) as it moves through the deployment lifecycle.

Governance becomes necessary as the number of models in production grows: knowing which models exist, who owns each one, what data they were trained on (important for compliance if that data includes regulated categories or must support deletion requests), and having an audit trail of who approved a given model for production and when. Model cards (structured documentation of a model's intended use, training data, performance across subgroups, and known limitations) support this and also help prevent a model built for one use case from being silently repurposed for another it wasn't validated for.

Cost management is a genuinely advanced-tier concern at scale: GPU costs for training and serving are often an organization's largest ML line item, so practices like spot-instance training with checkpointing (to tolerate preemption), right-sizing serving infrastructure to actual traffic, and model compression to reduce serving cost all become first-class engineering concerns, not afterthoughts.`,
    keyPoints: [
      "ML CI/CD gates production promotion on automated evaluation, including subgroup metrics",
      "Reproducibility requires versioning data, code/config, and model artifacts together",
      "A model registry tracks lineage and promotion status (staging/production/archived) per model version",
      "Governance needs model ownership, training-data provenance, and an approval audit trail",
      "Model cards document intended use, training data, and limitations to prevent misuse",
      "GPU cost management (spot instances, right-sizing, compression) is a first-class concern at scale"
    ]
  },
  {
    id: "model-serving-architectures",
    title: "Model Serving Architectures",
    category: "sysdesign",
    tier: "core",
    summary: "The main patterns for exposing a trained model's predictions to applications — batch, online real-time, and streaming — each fitting different latency needs.",
    content:
`Batch serving precomputes predictions for a known set of entities on a schedule (e.g. nightly churn scores for every user) and stores them for lookup, which is the simplest and cheapest pattern when you don't need a prediction for an entity or input that didn't exist at precompute time, and it decouples serving latency entirely from model inference time since a lookup is fast regardless of how expensive the model itself is to run.

Online (real-time) serving computes a prediction on demand in response to a request, typically through a REST or gRPC endpoint wrapping the model, which is necessary whenever the input isn't known ahead of time (e.g. ranking search results for a query just typed) or a prediction must reflect the very latest data. This pattern has to actively manage tail latency (p95/p99, not just average latency, since a slow outlier request degrades user experience even if the average looks fine), and typically needs the model loaded in memory across multiple replicas behind a load balancer to handle concurrent request volume.

Streaming serving sits between the two: predictions are computed continuously as new events arrive on a stream (e.g. real-time fraud scoring as transactions occur), trading the scheduling simplicity of batch for lower latency than a nightly job, without needing to handle arbitrary synchronous request/response traffic the way online serving does.

A common hybrid is precomputing predictions in batch for most entities but falling back to real-time computation for the (rarer) entities or inputs missing from the precomputed set — balancing cost against the flexibility of always-fresh predictions. The choice among these three isn't really a modeling decision at all — it follows directly from the product's actual latency and freshness requirements, which is exactly why clarifying those requirements up front (as in the system design framework) matters so much.`,
    keyPoints: [
      "Batch serving precomputes predictions on a schedule — cheap, simple, but not fresh or ad hoc",
      "Online serving computes on demand for unknown-ahead-of-time inputs, needs tail-latency management",
      "Streaming serving scores continuously as events arrive, balancing freshness and complexity",
      "Online serving requires multiple in-memory replicas behind a load balancer for concurrency",
      "Hybrid batch-with-real-time-fallback is a common pattern balancing cost and freshness",
      "The right pattern follows from the product's latency/freshness requirement, not model choice"
    ]
  },
  {
    id: "recommendation-system-design",
    title: "Recommendation System Design",
    category: "sysdesign",
    tier: "core",
    summary: "How large-scale recommenders narrow millions of items down to a personalized, ranked handful, typically via a multi-stage funnel architecture.",
    content:
`Scoring every item in a catalog against every user with a complex model is computationally infeasible at scale, so production recommenders almost universally use a funnel: candidate generation (retrieval) first narrows millions of items down to a few hundred or thousand plausible candidates cheaply, then ranking applies a more expensive, more accurate model to just those candidates to produce the final ordered list, and sometimes a final re-ranking stage adjusts for business rules like diversity or freshness.

Candidate generation commonly combines multiple sources: collaborative filtering (recommending items liked by similar users, or items similar to what this user already liked, based purely on interaction patterns — works well with enough data but struggles for new users/items, the classic "cold start" problem), content-based filtering (using item/user features/metadata directly, which handles cold start better since it doesn't require interaction history), and increasingly, embedding-based retrieval (learning dense vector representations of users and items such that relevant pairs are close together, then using approximate nearest-neighbor search to retrieve candidates efficiently).

Ranking uses a richer model — often a gradient-boosted tree or a deep neural network taking many more features (user, item, and crucially context — time of day, device, session behavior) — since it only needs to score a few hundred candidates rather than the whole catalog, so a heavier model is affordable there specifically. The objective ranking optimizes for (click-through rate, watch time, purchase probability) should reflect genuine long-term value, not just an easily-gamed short-term proxy — optimizing purely for clicks, for instance, famously tends to promote clickbait/sensational content over genuinely satisfying content.

Cold start (new users, new items) and diversity/filter-bubble concerns (a purely accuracy-optimized recommender can over-narrow what a user sees) are the two failure modes interviewers most often push on beyond the core architecture.`,
    keyPoints: [
      "Production recommenders use a funnel: cheap candidate generation, then expensive ranking on a small set",
      "Collaborative filtering uses interaction patterns; content-based filtering uses item/user features directly",
      "Embedding-based retrieval with ANN search is now a common, efficient candidate generation approach",
      "Ranking affords a heavier model since it only scores a few hundred candidates, not the whole catalog",
      "Optimizing purely for short-term engagement (clicks) can promote low-quality/clickbait content",
      "Cold start and diversity/filter-bubble effects are the classic failure modes beyond raw accuracy"
    ]
  },
  {
    id: "search-ranking-systems",
    title: "Search & Ranking Systems",
    category: "sysdesign",
    tier: "core",
    summary: "How search engines go from a raw query to a ranked list of results, combining classic information retrieval with learned ranking models.",
    content:
`Search systems, like recommenders, generally use a multi-stage funnel for the same computational reason: retrieval first narrows a huge corpus down to a manageable candidate set using cheap methods, then ranking applies a more expensive, accurate model to just those candidates. Retrieval combines lexical/sparse methods (inverted indexes plus a scoring function like BM25, which matches on exact or near-exact terms and is still very effective for queries with specific keywords, product codes, or names) with semantic/dense methods (embedding the query and documents, retrieving by vector similarity, which catches relevant results that share meaning but not exact wording) — hybrid retrieval combining both usually beats either alone.

Learning-to-rank (LTR) is the standard framing for the ranking stage: rather than hand-tuning a scoring formula, a model is trained on relevance-labeled data (from human judgments, or more commonly, inferred from click behavior) to directly optimize a ranking-quality objective. Pointwise approaches predict a relevance score per document independently; pairwise approaches learn to correctly order pairs of documents; listwise approaches optimize the whole ranked list's quality directly (e.g. against NDCG) — listwise generally aligns best with what's actually being measured but is more complex to train.

Ranking-quality metrics matter for both offline evaluation and understanding what "good" means here: NDCG (normalized discounted cumulative gain) rewards relevant results appearing near the top of the list, discounting relevance found further down, matching the reality that users rarely scroll far; MRR (mean reciprocal rank) focuses specifically on how quickly the first relevant result appears.

A well-known trap in using click data as a relevance signal is position bias — users click higher-ranked results more just because they're higher-ranked, independent of true relevance — which, left uncorrected, creates a feedback loop where the current ranking's biases get baked into the training data for the next model. Techniques like randomizing result order for a small traffic slice, or explicitly modeling position bias in the training objective, are standard mitigations.`,
    keyPoints: [
      "Search uses a funnel too: cheap retrieval narrows the corpus, then a heavier model ranks the candidates",
      "Hybrid retrieval (lexical/BM25 + dense/embedding) generally beats either method alone",
      "Learning-to-rank trains a model on relevance data instead of a hand-tuned scoring formula",
      "Listwise LTR optimizes the whole ranked list directly and aligns best with metrics like NDCG",
      "NDCG rewards relevance near the top of results; MRR focuses on how fast the first relevant hit appears",
      "Click-based relevance labels suffer position bias, which needs explicit correction to avoid a feedback loop"
    ]
  },
];

// ---------------------------------------------------------------
// DSA_CATEGORIES
// Each category: { id, name, icon, problems: [{ id, name, hint, difficulty }] }
// "hint" is an original one-line nudge, not a solution.
// difficulty: 'Easy' | 'Medium' | 'Hard'
// ---------------------------------------------------------------

const DSA_CATEGORIES = [
  {
    id: "arrays-strings",
    name: "Arrays & Strings",
    icon: "🔤",
    problems: [
      { id: "as-two-sum", name: "Two Sum", difficulty: "Easy", leetcode: "https://leetcode.com/problems/two-sum/", hint: "A hash map of value → index turns an O(n²) search into a single O(n) pass." },
      { id: "as-best-time-stock", name: "Best Time to Buy and Sell Stock", difficulty: "Easy", leetcode: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/", hint: "Track the minimum price seen so far while scanning once left to right." },
      { id: "as-product-except-self", name: "Product of Array Except Self", difficulty: "Medium", leetcode: "https://leetcode.com/problems/product-of-array-except-self/", hint: "Compute prefix products, then multiply in suffix products on a second pass, without division." },
      { id: "as-max-subarray", name: "Maximum Subarray", difficulty: "Medium", leetcode: "https://leetcode.com/problems/maximum-subarray/", hint: "Kadane's algorithm: at each index decide whether to extend the running sum or restart from here." },
      { id: "as-merge-intervals", name: "Merge Intervals", difficulty: "Medium", leetcode: "https://leetcode.com/problems/merge-intervals/", hint: "Sort by start time first, then merge whenever the next interval overlaps the current one." },
    ],
  },
  {
    id: "hashmap",
    name: "HashMap",
    icon: "🗂️",
    problems: [
      { id: "hm-group-anagrams", name: "Group Anagrams", difficulty: "Medium", leetcode: "https://leetcode.com/problems/group-anagrams/", hint: "Use each word's sorted-letters (or letter-count tuple) as the hash map key." },
      { id: "hm-contains-duplicate", name: "Contains Duplicate", difficulty: "Easy", leetcode: "https://leetcode.com/problems/contains-duplicate/", hint: "A set that grows as you scan turns this into one pass with O(1) lookups." },
      { id: "hm-top-k-frequent", name: "Top K Frequent Elements", difficulty: "Medium", leetcode: "https://leetcode.com/problems/top-k-frequent-elements/", hint: "Count frequencies with a map, then use bucket sort by frequency to avoid a full sort." },
      { id: "hm-subarray-sum-k", name: "Subarray Sum Equals K", difficulty: "Medium", leetcode: "https://leetcode.com/problems/subarray-sum-equals-k/", hint: "Track running prefix sums in a map; a subarray sums to k when prefix[j] - k has been seen before." },
      { id: "hm-longest-consecutive", name: "Longest Consecutive Sequence", difficulty: "Medium", leetcode: "https://leetcode.com/problems/longest-consecutive-sequence/", hint: "Put all values in a set, then only start counting a run from numbers whose predecessor is absent." },
      { id: "hm-valid-anagram", name: "Valid Anagram", difficulty: "Easy", leetcode: "https://leetcode.com/problems/valid-anagram/", hint: "Compare letter-count maps of both strings, or sort both and check equality." },
    ],
  },
  {
    id: "two-pointers",
    name: "Two Pointers",
    icon: "👉",
    attachments: [
      { href: "assets/files/two-pointers-cheatsheet.pdf", label: "Two Pointers Cheat Sheet (PDF)" },
    ],
    problems: [
      { id: "tp-valid-palindrome", name: "Valid Palindrome", difficulty: "Easy", leetcode: "https://leetcode.com/problems/valid-palindrome/", hint: "Move inward pointers from both ends, skipping non-alphanumeric characters as you go." },
      { id: "tp-3sum", name: "3Sum", difficulty: "Medium", leetcode: "https://leetcode.com/problems/3sum/", hint: "Sort first, fix one number, then two-pointer the rest of the array for the remaining pair." },
      { id: "tp-container-water", name: "Container With Most Water", difficulty: "Medium", leetcode: "https://leetcode.com/problems/container-with-most-water/", hint: "Start pointers at both ends and always move the pointer at the shorter line inward." },
      { id: "tp-trapping-rain", name: "Trapping Rain Water", difficulty: "Hard", leetcode: "https://leetcode.com/problems/trapping-rain-water/", hint: "Water trapped at each index is limited by the shorter of the max walls to its left and right." },
      { id: "tp-sort-colors", name: "Sort Colors", difficulty: "Medium", leetcode: "https://leetcode.com/problems/sort-colors/", hint: "Dutch national flag: three pointers partition the array into 0s, 1s, and 2s in one pass." },
      { id: "tp-remove-duplicates", name: "Remove Duplicates from Sorted Array", difficulty: "Easy", leetcode: "https://leetcode.com/problems/remove-duplicates-from-sorted-array/", hint: "A slow write-pointer only advances when the current value differs from the last kept value." },
    ],
  },
  {
    id: "sliding-window",
    name: "Sliding Window",
    icon: "📏",
    attachments: [
      { href: "assets/files/sliding-window-cheatsheet.pdf", label: "Sliding Window Cheat Sheet (PDF)" },
    ],
    problems: [
      { id: "sw-longest-substr", name: "Longest Substring Without Repeating Characters", difficulty: "Medium", leetcode: "https://leetcode.com/problems/longest-substring-without-repeating-characters/", hint: "Grow the right edge, track last-seen index per char, and jump the left edge past any repeat." },
      { id: "sw-at-most-k-distinct", name: "Longest Substring with At Most K Distinct Characters", difficulty: "Medium", leetcode: "https://leetcode.com/problems/longest-substring-with-at-most-k-distinct-characters/", hint: "Keep a frequency map; shrink from the left whenever the map holds more than k distinct keys." },
      { id: "sw-exactly-k-distinct", name: "Longest Substring with Exactly K Distinct Characters", difficulty: "Medium", hint: "Compute atMost(k) − atMost(k−1) to turn an 'exactly' constraint into two 'at most' sliding windows." },
      { id: "sw-char-replacement", name: "Longest Repeating Character Replacement", difficulty: "Medium", leetcode: "https://leetcode.com/problems/longest-repeating-character-replacement/", hint: "Window is valid while (window size − count of its most frequent char) ≤ k replacements." },
      { id: "sw-max-consecutive-ones", name: "Max Consecutive Ones III", difficulty: "Medium", leetcode: "https://leetcode.com/problems/max-consecutive-ones-iii/", hint: "Same shape as character replacement: shrink whenever the window's zero-count exceeds k flips." },
      { id: "sw-fruit-into-baskets", name: "Fruit Into Baskets", difficulty: "Medium", leetcode: "https://leetcode.com/problems/fruit-into-baskets/", hint: "This is 'at most 2 distinct types' in disguise — reuse the at-most-K-distinct template with k=2." },
      { id: "sw-min-window-substring", name: "Minimum Window Substring", difficulty: "Hard", leetcode: "https://leetcode.com/problems/minimum-window-substring/", hint: "Expand until every required character is covered, then greedily shrink from the left while still valid." },
    ],
  },
  {
    id: "linked-lists",
    name: "Linked Lists",
    icon: "🔗",
    problems: [
      { id: "ll-reverse", name: "Reverse Linked List", difficulty: "Easy", leetcode: "https://leetcode.com/problems/reverse-linked-list/", hint: "Walk the list once, re-pointing each node's next to the previous node as you go." },
      { id: "ll-merge-two-sorted", name: "Merge Two Sorted Lists", difficulty: "Easy", leetcode: "https://leetcode.com/problems/merge-two-sorted-lists/", hint: "Use a dummy head node and repeatedly attach whichever list's current node is smaller." },
      { id: "ll-cycle", name: "Linked List Cycle", difficulty: "Easy", leetcode: "https://leetcode.com/problems/linked-list-cycle/", hint: "Floyd's fast/slow pointers meet inside a cycle if and only if one exists." },
      { id: "ll-remove-nth-end", name: "Remove Nth Node From End of List", difficulty: "Medium", leetcode: "https://leetcode.com/problems/remove-nth-node-from-end-of-list/", hint: "Advance a lead pointer n steps first, then move both pointers together to find the target." },
      { id: "ll-reorder-list", name: "Reorder List", difficulty: "Medium", leetcode: "https://leetcode.com/problems/reorder-list/", hint: "Find the middle, reverse the second half, then merge the two halves alternately." },
      { id: "ll-copy-random-pointer", name: "Copy List with Random Pointer", difficulty: "Medium", leetcode: "https://leetcode.com/problems/copy-list-with-random-pointer/", hint: "A hash map from original node to its clone lets you wire up random pointers in a second pass." },
    ],
  },
  {
    id: "trees",
    name: "Trees",
    icon: "🌳",
    problems: [
      { id: "tr-max-depth", name: "Maximum Depth of Binary Tree", difficulty: "Easy", leetcode: "https://leetcode.com/problems/maximum-depth-of-binary-tree/", hint: "1 + the larger of the max depths of the left and right subtrees, recursively." },
      { id: "tr-validate-bst", name: "Validate Binary Search Tree", difficulty: "Medium", leetcode: "https://leetcode.com/problems/validate-binary-search-tree/", hint: "Recurse with a valid (low, high) range per node rather than only comparing to immediate children." },
      { id: "tr-level-order", name: "Binary Tree Level Order Traversal", difficulty: "Medium", leetcode: "https://leetcode.com/problems/binary-tree-level-order-traversal/", hint: "A queue-based BFS, processing one full level's worth of nodes before moving to the next." },
      { id: "tr-lca-bst", name: "Lowest Common Ancestor of a BST", difficulty: "Medium", leetcode: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/", hint: "Use BST ordering: branch left if both targets are smaller, right if both are larger, else you're at the LCA." },
      { id: "tr-invert-tree", name: "Invert Binary Tree", difficulty: "Easy", leetcode: "https://leetcode.com/problems/invert-binary-tree/", hint: "At each node, swap the left and right children, then recurse into both." },
      { id: "tr-serialize-deserialize", name: "Serialize and Deserialize Binary Tree", difficulty: "Hard", leetcode: "https://leetcode.com/problems/serialize-and-deserialize-binary-tree/", hint: "Preorder traversal with explicit null markers lets you reconstruct the tree unambiguously." },
      { id: "tr-diameter", name: "Diameter of Binary Tree", difficulty: "Easy", leetcode: "https://leetcode.com/problems/diameter-of-binary-tree/", hint: "At every node, track left-depth + right-depth as a candidate diameter while computing height." },
    ],
  },
  {
    id: "graphs",
    name: "Graphs",
    icon: "🕸️",
    problems: [
      { id: "gr-number-islands", name: "Number of Islands", difficulty: "Medium", leetcode: "https://leetcode.com/problems/number-of-islands/", hint: "DFS or BFS flood-fill from each unvisited land cell, marking every connected cell visited." },
      { id: "gr-course-schedule", name: "Course Schedule", difficulty: "Medium", leetcode: "https://leetcode.com/problems/course-schedule/", hint: "This is cycle detection on a directed graph — topological sort succeeds only if no cycle exists." },
      { id: "gr-clone-graph", name: "Clone Graph", difficulty: "Medium", leetcode: "https://leetcode.com/problems/clone-graph/", hint: "DFS/BFS with a map from original node to its clone avoids infinite loops on cycles." },
      { id: "gr-word-ladder", name: "Word Ladder", difficulty: "Hard", leetcode: "https://leetcode.com/problems/word-ladder/", hint: "BFS over words where an edge connects words differing by exactly one letter finds the shortest path." },
      { id: "gr-pacific-atlantic", name: "Pacific Atlantic Water Flow", difficulty: "Medium", leetcode: "https://leetcode.com/problems/pacific-atlantic-water-flow/", hint: "Run BFS/DFS inward from each ocean's border cells and intersect the two reachable sets." },
      { id: "gr-valid-tree", name: "Graph Valid Tree", difficulty: "Medium", leetcode: "https://leetcode.com/problems/graph-valid-tree/", hint: "A graph is a valid tree exactly when it's connected and has exactly n-1 edges (no cycles)." },
    ],
  },
  {
    id: "heaps",
    name: "Heaps",
    icon: "⛰️",
    problems: [
      { id: "hp-kth-largest", name: "Kth Largest Element in an Array", difficulty: "Medium", leetcode: "https://leetcode.com/problems/kth-largest-element-in-an-array/", hint: "Maintain a min-heap of size k; the heap's root is the answer once it's full." },
      { id: "hp-merge-k-sorted", name: "Merge K Sorted Lists", difficulty: "Hard", leetcode: "https://leetcode.com/problems/merge-k-sorted-lists/", hint: "A min-heap holding one node per list lets you always pop the next-smallest across all lists." },
      { id: "hp-top-k-words", name: "Top K Frequent Words", difficulty: "Medium", leetcode: "https://leetcode.com/problems/top-k-frequent-words/", hint: "Count frequencies, then use a heap with a comparator that breaks ties alphabetically." },
      { id: "hp-median-stream", name: "Find Median from Data Stream", difficulty: "Hard", leetcode: "https://leetcode.com/problems/find-median-from-data-stream/", hint: "Two heaps — a max-heap for the lower half, a min-heap for the upper half — kept balanced in size." },
      { id: "hp-task-scheduler", name: "Task Scheduler", difficulty: "Medium", leetcode: "https://leetcode.com/problems/task-scheduler/", hint: "Greedily schedule the most frequent remaining task first, using a max-heap plus a cooldown queue." },
    ],
  },
  {
    id: "dynamic-programming",
    name: "Dynamic Programming",
    icon: "🧩",
    problems: [
      { id: "dp-climbing-stairs", name: "Climbing Stairs", difficulty: "Easy", leetcode: "https://leetcode.com/problems/climbing-stairs/", hint: "ways(n) = ways(n-1) + ways(n-2) — it's just Fibonacci in disguise." },
      { id: "dp-coin-change", name: "Coin Change", difficulty: "Medium", leetcode: "https://leetcode.com/problems/coin-change/", hint: "Bottom-up: minCoins[amount] = 1 + min over each coin of minCoins[amount - coin]." },
      { id: "dp-lis", name: "Longest Increasing Subsequence", difficulty: "Medium", leetcode: "https://leetcode.com/problems/longest-increasing-subsequence/", hint: "dp[i] = length of the longest increasing subsequence ending exactly at index i." },
      { id: "dp-lcs", name: "Longest Common Subsequence", difficulty: "Medium", leetcode: "https://leetcode.com/problems/longest-common-subsequence/", hint: "2D table where dp[i][j] depends on whether characters i and j match, building from empty prefixes." },
      { id: "dp-house-robber", name: "House Robber", difficulty: "Medium", leetcode: "https://leetcode.com/problems/house-robber/", hint: "At each house, decide max(skip this house, rob it + best from two houses back)." },
      { id: "dp-word-break", name: "Word Break", difficulty: "Medium", leetcode: "https://leetcode.com/problems/word-break/", hint: "dp[i] is true if some earlier dp[j] is true and the substring from j to i is a dictionary word." },
      { id: "dp-edit-distance", name: "Edit Distance", difficulty: "Hard", leetcode: "https://leetcode.com/problems/edit-distance/", hint: "2D table over prefixes of both strings; each cell picks the cheapest of insert, delete, or replace." },
    ],
  },
  {
    id: "sql",
    name: "SQL",
    icon: "🗄️",
    problems: [
      { id: "sql-second-highest-salary", name: "Second Highest Salary", difficulty: "Medium", leetcode: "https://leetcode.com/problems/second-highest-salary/", hint: "DISTINCT plus ORDER BY/LIMIT with an OFFSET, or a subquery excluding the MAX, both work." },
      { id: "sql-employees-more-than-managers", name: "Employees Earning More Than Their Managers", difficulty: "Easy", leetcode: "https://leetcode.com/problems/employees-earning-more-than-their-managers/", hint: "Self-join the employee table to itself on the manager id column." },
      { id: "sql-duplicate-emails", name: "Duplicate Emails", difficulty: "Easy", leetcode: "https://leetcode.com/problems/duplicate-emails/", hint: "GROUP BY the email column and filter groups with HAVING COUNT(*) > 1." },
      { id: "sql-rising-temperature", name: "Rising Temperature", difficulty: "Easy", leetcode: "https://leetcode.com/problems/rising-temperature/", hint: "Self-join the table on date = date - 1 day and compare each day's temperature to the prior day's." },
      { id: "sql-dept-top-three-salaries", name: "Department Top Three Salaries", difficulty: "Hard", leetcode: "https://leetcode.com/problems/department-top-three-salaries/", hint: "A window function like DENSE_RANK partitioned by department handles ties correctly." },
      { id: "sql-consecutive-numbers", name: "Consecutive Numbers", difficulty: "Medium", leetcode: "https://leetcode.com/problems/consecutive-numbers/", hint: "Use LEAD/LAG window functions, or self-join the log table three times on consecutive ids." },
    ],
  },
  {
    id: "pandas",
    name: "Pandas",
    icon: "🐼",
    problems: [
      { id: "pd-filtering", name: "DataFrame Filtering Basics", difficulty: "Easy", hint: "Boolean masks (df[df['col'] > x]) are almost always faster and clearer than row-by-row loops." },
      { id: "pd-groupby-agg", name: "GroupBy Aggregation", difficulty: "Medium", hint: ".groupby('col').agg({...}) applies different aggregations per column in a single readable pass." },
      { id: "pd-merging", name: "Merging DataFrames", difficulty: "Medium", hint: "Know the difference between inner, left, right, and outer joins before picking merge's 'how' argument." },
      { id: "pd-pivot-tables", name: "Pivot Tables", difficulty: "Medium", hint: "pivot_table reshapes long data to wide and can aggregate duplicate index/column combinations automatically." },
      { id: "pd-missing-data", name: "Handling Missing Data", difficulty: "Easy", hint: "Decide deliberately between dropna, fillna with a statistic, and imputation — each changes your data's story." },
    ],
  },
  {
    id: "numpy",
    name: "NumPy",
    icon: "🔢",
    problems: [
      { id: "np-broadcasting", name: "Array Broadcasting", difficulty: "Medium", hint: "Shapes are compatible when, aligned from the right, each dimension matches or one of them is 1." },
      { id: "np-vectorization", name: "Vectorized Operations vs Loops", difficulty: "Easy", hint: "Replacing a Python for-loop with a NumPy array operation pushes the loop down into fast compiled C code." },
      { id: "np-boolean-masking", name: "Boolean Masking", difficulty: "Easy", hint: "arr[arr > threshold] selects elements without writing an explicit loop or index list." },
      { id: "np-reshaping", name: "Reshaping Arrays", difficulty: "Easy", hint: "reshape(-1, n) lets NumPy infer one dimension automatically from the array's total size." },
      { id: "np-einsum-matmul", name: "Matrix Multiplication with einsum", difficulty: "Hard", hint: "einsum notation makes the exact summed/broadcast index pattern explicit for tensor contractions beyond plain matmul." },
    ],
  },
];

// ---------------------------------------------------------------
// BEHAVIORAL_QUESTIONS
// Each: { id, question, group }
// group is a loose label used to visually cluster questions.
// ---------------------------------------------------------------

const STAR_GUIDE =
  "The STAR method structures a behavioral answer into four beats so it stays concrete instead of vague: " +
  "Situation sets the scene in a sentence or two (what team, what context, what was at stake); Task names the " +
  "specific goal or problem that was yours to solve; Action walks through what you concretely did — the decisions " +
  "you made and why, not just what the team did; and Result closes with the measurable or observable outcome, " +
  "plus, ideally, what you'd do differently in hindsight. For data science and ML interviews specifically, a strong " +
  "Result often includes a number (a metric moved, time saved, a model's lift over baseline) and a strong Action " +
  "shows your specific technical or analytical judgment, not just that you 'worked hard' on the problem.";

const BEHAVIORAL_QUESTIONS = [
  { id: "bq-leadership-1", group: "Leadership", question: "Tell me about a time you led a data science or analytics project without formal authority over the team involved." },
  { id: "bq-leadership-2", group: "Leadership", question: "Describe a situation where you had to convince a skeptical team to adopt a new model, tool, or approach." },
  { id: "bq-conflict-1", group: "Conflict", question: "Tell me about a disagreement you had with a colleague or manager about a modeling or analytical approach — how was it resolved?" },
  { id: "bq-conflict-2", group: "Conflict", question: "Describe a time your analysis or recommendation directly conflicted with what a stakeholder wanted to hear." },
  { id: "bq-failure-1", group: "Failure", question: "Tell me about a model or project that failed or underperformed in production. What did you learn?" },
  { id: "bq-failure-2", group: "Failure", question: "Describe a mistake you made in an analysis that had real consequences, and how you handled it once discovered." },
  { id: "bq-ambiguity-1", group: "Ambiguity", question: "Tell me about a time you were given a vague or poorly-scoped problem and had to define the approach yourself." },
  { id: "bq-ambiguity-2", group: "Ambiguity", question: "Describe a project where the requirements or success metric changed significantly midway through." },
  { id: "bq-stakeholder-1", group: "Stakeholder Communication", question: "Tell me about a time you had to explain a complex technical result to a non-technical audience." },
  { id: "bq-stakeholder-2", group: "Stakeholder Communication", question: "Describe a situation where you had to manage competing priorities from multiple stakeholders on the same project." },
  { id: "bq-impact-1", group: "Project Impact", question: "Tell me about the project you're most proud of. What was your specific contribution and its measurable impact?" },
  { id: "bq-impact-2", group: "Project Impact", question: "Describe a time you identified an opportunity for a data-driven improvement that nobody had asked you to look into." },
];
