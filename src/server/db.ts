import bcrypt from 'bcryptjs';
import {
  User,
  Course,
  Conversation,
  DocumentUpload,
  Quiz,
  QuizAttempt,
  TopicMastery,
  StudyPlan,
  EducationalResearchJob,
  LiveClass,
  StudentNotebookNote,
} from '../types/index.ts';

// Deterministic salt & hash helper
const hashSync = (pw: string) => bcrypt.hashSync(pw, 10);

export interface InMemoryDB {
  users: (User & { passwordHash: string })[];
  courses: Course[];
  conversations: Conversation[];
  documents: DocumentUpload[];
  quizzes: Quiz[];
  quizAttempts: QuizAttempt[];
  topicMastery: Record<string, TopicMastery[]>; // keyed by userId
  studyPlans: Record<string, StudyPlan>; // keyed by userId
  researchJobs: EducationalResearchJob[];
  auditLogs: { id: string; action: string; userId: string; timestamp: string; details: string }[];
  liveClasses: LiveClass[];
  studentNotes: StudentNotebookNote[];
}

export const db: InMemoryDB = {
  users: [
    {
      id: 'usr_student_1',
      name: 'Aarav Sharma',
      email: 'student@aiguru.edu',
      passwordHash: hashSync('GuruPass123!'),
      role: 'student',
      preferredLanguage: 'hi',
      educationalLevel: 'Class 10 CBSE & JEE Foundation',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'usr_teacher_1',
      name: 'Dr. Priya Raman',
      email: 'teacher@aiguru.edu',
      passwordHash: hashSync('GuruPass123!'),
      role: 'teacher',
      preferredLanguage: 'en',
      educationalLevel: 'Senior Faculty - STEM & Pedagogy',
      createdAt: new Date().toISOString(),
      teacherDegree: {
        degreeLevel: 'phd',
        degreeName: 'Doctor of Philosophy (Ph.D.) in Mathematics & Pedagogy',
        institution: 'University of Delhi / IIT Delhi',
        graduationYear: '2019',
        specialization: 'Pure Mathematics, Calculus & Educational AI',
        documentName: 'Dr_Priya_Raman_PhD_Doctoral_Degree.pdf',
        documentUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
        verified: true,
        verifiedAt: '2023-01-15T10:00:00.000Z',
      },
    },
    {
      id: 'usr_admin_1',
      name: 'Vikram Sengupta',
      email: 'admin@aiguru.edu',
      passwordHash: hashSync('GuruPass123!'),
      role: 'admin',
      preferredLanguage: 'en',
      educationalLevel: 'Platform Academic Dean & Administrator',
      createdAt: new Date().toISOString(),
    },
  ],

  courses: [
    {
      id: 'crs_gate_da',
      title: 'GATE DA: Data Science & Artificial Intelligence (Master Exam Prep)',
      category: 'competitive',
      level: 'National PG Entrance & PSU Recruitment',
      boardOrExam: 'IISc / IIT GATE DA (Code: DA)',
      description: 'Comprehensive, high-yield preparation for GATE Data Science & AI (DA) mapped 100% to the official IISc/IIT syllabus. Covers Linear Algebra & SVD, Probability & Statistics, Calculus & Optimization, Python & DSA, DBMS & SQL, Machine Learning, and Artificial Intelligence & Neural Networks with live classes and numerical problem solving.',
      thumbnail: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=600&auto=format&fit=crop&q=80',
      teacherId: 'usr_teacher_1',
      teacherName: 'Dr. Priya Raman',
      teacherTitle: 'PhD IIT Delhi · Senior AI & Computational Mathematics Faculty',
      teacherAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      chaptersCount: 7,
      enrolledStudentsCount: 3410,
      isEnrolled: true,
      videoLectures: [
        {
          id: 'lec_gate_la_1',
          courseId: 'crs_gate_da',
          title: 'Lecture 1: Linear Algebra — Vector Spaces, Eigenvalues & SVD Derivation',
          platform: 'youtube',
          url: 'https://www.youtube.com/watch?v=fNk_zzaMoSs',
          duration: '52 mins',
          description: 'Rigorous derivation of Eigenvalues (Ax = λx), Characteristic Polynomial, Spectral Theorem, and Singular Value Decomposition (A = UΣVᵀ) for Machine Learning dimensionality reduction.',
          chapterTitle: 'Chapter 1: Linear Algebra & Matrix Decompositions',
          uploadedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
        },
        {
          id: 'lec_gate_prob_1',
          courseId: 'crs_gate_da',
          title: 'Lecture 2: Probability & Statistics — Bayes Theorem, CLT & Continuous Distributions',
          platform: 'youtube',
          url: 'https://www.youtube.com/watch?v=HZGCoVF3YvM',
          duration: '48 mins',
          description: 'Axioms of probability, Bayes rule for conditional reasoning, PDF/CDF of Gaussian & Exponential variables, and Central Limit Theorem sample statistics.',
          chapterTitle: 'Chapter 2: Probability & Mathematical Statistics',
          uploadedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        },
        {
          id: 'lec_gate_ml_1',
          courseId: 'crs_gate_da',
          title: 'Lecture 3: Machine Learning — Bias-Variance, L1/L2 Regularization & SVM Kernels',
          platform: 'youtube',
          url: 'https://www.youtube.com/watch?v=EuBBz3bI-aA',
          duration: '55 mins',
          description: 'Deep dive into Loss surfaces, Ridge vs Lasso sparsity mechanisms, Maximum Margin Hyperplanes, Dual Lagrange formulation, and Mercer Kernel trick.',
          chapterTitle: 'Chapter 6: Machine Learning (Supervised & Unsupervised)',
          uploadedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        },
        {
          id: 'lec_gate_ai_1',
          courseId: 'crs_gate_da',
          title: 'Lecture 4: Artificial Intelligence — A* Search, Admissible Heuristics & Alpha-Beta Pruning',
          platform: 'youtube',
          url: 'https://www.youtube.com/watch?v=0kFhy22J9-g',
          duration: '44 mins',
          description: 'Proving heuristic admissibility h(n) ≤ h*(n) and consistency, optimal path finding with A*, game tree Minimax, and pruning cutoff conditions.',
          chapterTitle: 'Chapter 7: Artificial Intelligence & Neural Networks',
          uploadedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
        },
        {
          id: 'lec_gate_dbms_1',
          courseId: 'crs_gate_da',
          title: 'Lecture 5: Database Systems — Relational Algebra, BCNF Normalization & B+ Trees',
          platform: 'youtube',
          url: 'https://www.youtube.com/watch?v=9PW9B6xH4F0',
          duration: '41 mins',
          description: 'Testing functional dependencies, finding minimal cover, proving lossless joins, and B+ tree index search/split mechanics.',
          chapterTitle: 'Chapter 5: Database Management Systems (DBMS & SQL)',
          uploadedAt: new Date().toISOString(),
        },
      ],
      recommendedBooks: [
        {
          title: 'Mathematics for Machine Learning',
          author: 'Marc Peter Deisenroth, A. Aldo Faisal, Cheng Soon Ong',
          role: 'Core Text: Linear Algebra, Analytic Geometry, Matrix Decompositions & Vector Calculus',
          link: 'https://mml-book.github.io/',
        },
        {
          title: 'Pattern Recognition and Machine Learning (PRML)',
          author: 'Christopher M. Bishop',
          role: 'Core Text: Supervised Learning, Bayesian Inference & Probability Distributions',
          link: 'https://www.microsoft.com/en-us/research/people/cmbishop/prml-book/',
        },
        {
          title: 'Artificial Intelligence: A Modern Approach (4th Ed.)',
          author: 'Stuart Russell & Peter Norvig',
          role: 'Standard Reference: State-space Search, Logic, Heuristics & AI Foundations',
        },
        {
          title: 'Database System Concepts (7th Ed.)',
          author: 'Abraham Silberschatz, Henry F. Korth, S. Sudarshan',
          role: 'Standard Reference: Relational Model, SQL, Normalization & Indexing',
        },
        {
          title: 'Official GATE DA Syllabus & Sample Question Paper',
          author: 'GATE Organising Institute (IISc Bangalore)',
          role: 'Official Exam Blueprint & Section Weightage',
        },
      ],
      referenceTools: [
        {
          title: 'SymPy Linear Algebra Calculator',
          type: 'Math Engine',
          url: 'https://www.sympy.org',
          description: 'Deterministic tool for computing matrix rank, eigenvalues, and SVD in AI Guru.',
        },
        {
          title: 'NumPy & SciPy Documentation',
          type: 'Data Science Library',
          url: 'https://numpy.org',
          description: 'Reference for array broadcasting, matrix multiplication, and linear algebra routines.',
        },
      ],
      chapters: [
        {
          id: 'ch_gate_la',
          courseId: 'crs_gate_da',
          title: 'Chapter 1: Linear Algebra & Matrix Decompositions (रैखिक बीजगणित)',
          sequence: 1,
          learningObjectives: [
            'Master Vector Spaces, Subspaces, Basis, Dimension, and Linear Independence',
            'Compute Rank, Determinant, Trace, and solve Ax = b via Gaussian Elimination',
            'Evaluate Eigenvalues, Eigenvectors, Diagonalization, and Characteristic Polynomials',
            'Derive and compute Singular Value Decomposition (SVD) and Low-Rank Approximations (PCA)',
          ],
          topics: [
            {
              id: 'top_gate_eigen',
              title: 'Eigenvalues, Eigenvectors & Diagonalization',
              difficulty: 'hard',
              summary: 'For an n×n matrix A, Ax = λx. The scalar λ is an eigenvalue and x ≠ 0 is the eigenvector. Found via det(A - λI) = 0. Trace(A) = Σ λ_i and det(A) = ∏ λ_i.',
              formulas: ['Ax = λx', 'det(A - λI) = 0', 'Trace(A) = Σ λ_i', 'det(A) = ∏ λ_i', 'A = P D P⁻¹'],
              keyPoints: [
                'Symmetric matrices have real eigenvalues and orthogonal eigenvectors',
                'A is diagonalizable if and only if it has n linearly independent eigenvectors',
                'Similar matrices share identical eigenvalues and determinants',
              ],
            },
            {
              id: 'top_gate_svd',
              title: 'Singular Value Decomposition (SVD) & PCA',
              difficulty: 'hard',
              summary: 'Every real m×n matrix A can be factored as A = U Σ Vᵀ, where U is m×m orthogonal, Σ is m×n diagonal with singular values σ_i = √(λ_i(AᵀA)), and V is n×n orthogonal.',
              formulas: ['A = U Σ Vᵀ', 'σ_i = √(λ_i(AᵀA))', 'A_k = Σ_{i=1}^k σ_i u_i v_iᵀ (Eckart-Young Theorem)'],
              keyPoints: [
                'Singular values are always non-negative real numbers arranged in descending order: σ₁ ≥ σ₂ ≥ ... ≥ 0',
                'Rank of A equals the count of strictly positive singular values',
                'Low-rank approximation minimizes the Frobenius norm ||A - A_k||_F',
              ],
            },
          ],
        },
        {
          id: 'ch_gate_prob',
          courseId: 'crs_gate_da',
          title: 'Chapter 2: Probability & Mathematical Statistics (प्रायिकता एवं सांख्यिकी)',
          sequence: 2,
          learningObjectives: [
            'Axioms of Probability, Conditional Probability, and Bayes\' Theorem with Likelihood',
            'Random Variables: Probability Mass Functions (PMF), Probability Density Functions (PDF), and CDF',
            'Distributions: Bernoulli, Binomial, Poisson, Uniform, Exponential, and Normal (Gaussian)',
            'Expectation, Variance, Covariance, Correlation Coefficient, and Central Limit Theorem (CLT)',
            'Hypothesis Testing: Null/Alternative hypothesis, p-values, z-test, t-test, and Chi-Square test',
          ],
          topics: [
            {
              id: 'top_gate_bayes',
              title: 'Conditional Probability & Bayes\' Rule',
              difficulty: 'medium',
              summary: 'P(A|B) = [P(B|A) · P(A)] / P(B). Fundamental basis of Naive Bayes classifiers and Bayesian machine learning parameter estimation.',
              formulas: ['P(A|B) = P(A ∩ B) / P(B)', 'P(A|B) = P(B|A)P(A) / Σ P(B|A_i)P(A_i)'],
              keyPoints: [
                'P(A) is the prior probability, P(A|B) is the posterior probability',
                'P(B|A) is the likelihood of observing evidence B given hypothesis A',
                'Independence: P(A ∩ B) = P(A) · P(B) if and only if A and B are independent',
              ],
            },
            {
              id: 'top_gate_clt',
              title: 'Central Limit Theorem & Sampling Distributions',
              difficulty: 'hard',
              summary: 'For any independent and identically distributed (i.i.d.) random variables with mean μ and variance σ², the sample mean X̄ approaches a normal distribution N(μ, σ²/n) as n → ∞.',
              formulas: ['Z = (X̄ - μ) / (σ / √n) ~ N(0, 1)', 'Var(X̄) = σ² / n', 'Cov(X, Y) = E[XY] - E[X]E[Y]'],
              keyPoints: [
                'Applies regardless of the underlying distribution of the population as long as variance is finite',
                'Standard error of the mean shrinks at rate 1/√n',
                'Correlation r = Cov(X,Y) / (σ_X σ_Y) is bounded in [-1, +1]',
              ],
            },
          ],
        },
        {
          id: 'ch_gate_opt',
          courseId: 'crs_gate_da',
          title: 'Chapter 3: Calculus & Numerical Optimization (कलन एवं अनुकूलन)',
          sequence: 3,
          learningObjectives: [
            'Functions of single and several variables, Limits, Continuity, Partial Derivatives, and Gradient',
            'Directional Derivatives, Hessian Matrix, and classification of critical points (Local Minima, Maxima, Saddle Points)',
            'Convex sets, Convex and Concave functions, Jensen\'s Inequality, and Global Optimality',
            'Unconstrained and Constrained Optimization: Gradient Descent, Learning Rate, and Lagrange Multipliers',
          ],
          topics: [
            {
              id: 'top_gate_gradient',
              title: 'Gradient Vector, Hessian Matrix & Curvature',
              difficulty: 'hard',
              summary: 'Gradient ∇f(x) points in the direction of steepest ascent. The Hessian matrix H contains second-order partial derivatives. If H is positive definite at a stationary point, it is a local minimum.',
              formulas: ['∇f(x) = [∂f/∂x₁, ..., ∂f/∂x_n]ᵀ', 'H_{ij} = ∂²f / (∂x_i ∂x_j)', 'det(H - λI) > 0 for positive definiteness'],
              keyPoints: [
                'At stationary points, ∇f(x) = 0',
                'H positive definite (all eigenvalues > 0) => strict local minimum',
                'H indefinite (both positive and negative eigenvalues) => saddle point',
              ],
            },
            {
              id: 'top_gate_grad_descent',
              title: 'Gradient Descent & Convex Optimization',
              difficulty: 'medium',
              summary: 'Iterative update rule: w_{t+1} = w_t - η ∇L(w_t). In convex functions, any local minimum is guaranteed to be a global minimum.',
              formulas: ['w_{t+1} = w_t - η ∇L(w_t)', 'f(θx + (1-θ)y) ≤ θ f(x) + (1-θ) f(y)', 'L(x, λ) = f(x) + λ g(x)'],
              keyPoints: [
                'Learning rate η too large causes divergence; too small causes slow convergence',
                'Momentum accelerates gradient descent through shallow ravines',
                'Lagrange multipliers convert constrained problems into unconstrained saddle problems',
              ],
            },
          ],
        },
        {
          id: 'ch_gate_dsa',
          courseId: 'crs_gate_da',
          title: 'Chapter 4: Programming, Data Structures & Algorithms (Python & DSA)',
          sequence: 4,
          learningObjectives: [
            'Python programming essentials: list comprehensions, NumPy vectorization, Pandas operations',
            'Basic data structures: Arrays, Linked Lists, Stacks, Queues, Hash Tables and Collision resolution',
            'Trees & Graphs: Binary Search Trees, Heaps/Priority Queues, Breadth-First Search (BFS), Depth-First Search (DFS)',
            'Searching & Sorting: Linear Search, Binary Search, Merge Sort, Quick Sort, and Asymptotic Complexity (Big-O, Ω, Θ)',
          ],
          topics: [
            {
              id: 'top_gate_complexity',
              title: 'Asymptotic Analysis & Recurrence Relations',
              difficulty: 'medium',
              summary: 'Evaluation of worst-case, average-case, and best-case time/space bounds. Solving recurrences T(n) = aT(n/b) + f(n) using the Master Theorem.',
              formulas: ['T(n) = aT(n/b) + O(n^d)', 'MergeSort: O(n log n)', 'Binary Search: O(log n)', 'QuickSort: O(n log n) avg, O(n²) worst'],
              keyPoints: [
                'If log_b(a) > d, then T(n) = Θ(n^{log_b(a)})',
                'If log_b(a) = d, then T(n) = Θ(n^d log n)',
                'Hash Table search with chaining is expected O(1) time',
              ],
            },
            {
              id: 'top_gate_trees',
              title: 'Binary Search Trees & Heaps',
              difficulty: 'medium',
              summary: 'BST maintains left < root < right invariant. Min/Max Heap satisfies parent ≤/≥ children. Building a heap takes O(n) time; extract-min takes O(log n).',
              formulas: ['Height of balanced BST: O(log n)', 'Heap building: O(n)', 'Heap sort: O(n log n)'],
              keyPoints: [
                'Inorder traversal of a BST yields elements in strictly sorted order',
                'Priority queues implemented with binary heaps support fast insertion and deletion',
              ],
            },
          ],
        },
        {
          id: 'ch_gate_dbms',
          courseId: 'crs_gate_da',
          title: 'Chapter 5: Database Management Systems (DBMS & SQL)',
          sequence: 5,
          learningObjectives: [
            'Relational Model, ER Diagrams, Candidate Keys, Primary Keys, and Foreign Key Integrity',
            'Relational Algebra operators: Selection (σ), Projection (π), Cross Product (×), Joins (⋈), Division (÷)',
            'SQL queries: Aggregation, GROUP BY, HAVING, Nested Subqueries, Correlated Subqueries, and Window Functions',
            'Normalization: Functional Dependencies, Attribute Closure (F⁺), 1NF, 2NF, 3NF, BCNF, and Lossless Joins',
            'Indexing: B-Trees and B+ Trees, Query Processing, and ACID Transaction Properties',
          ],
          topics: [
            {
              id: 'top_gate_bcnf',
              title: 'Functional Dependencies & Normal Forms (3NF vs BCNF)',
              difficulty: 'hard',
              summary: 'A relation R is in 3NF if for every non-trivial FD X → A, either X is a superkey or A is a prime attribute. R is in BCNF if for every non-trivial FD X → A, X must be a superkey.',
              formulas: ['Closure: X⁺', 'Lossless: R₁ ∩ R₂ → R₁ or R₁ ∩ R₂ → R₂', 'Dependency Preservation: (F₁ ∪ F₂)⁺ = F⁺'],
              keyPoints: [
                'BCNF is strictly stronger than 3NF (every BCNF relation is in 3NF)',
                '3NF always guarantees both lossless join and dependency preservation',
                'BCNF may not always preserve all functional dependencies',
              ],
            },
            {
              id: 'top_gate_sql',
              title: 'Relational Algebra & SQL Complex Queries',
              difficulty: 'medium',
              summary: 'Declarative SQL execution model: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY. Relational algebra equivalences for query optimization.',
              formulas: ['R ⋈_{cond} S = σ_{cond}(R × S)', 'π_{attr}(σ_{cond}(R))'],
              keyPoints: [
                'WHERE filters individual rows before grouping; HAVING filters aggregated groups',
                'Left outer join preserves unmatched rows from the left table with NULL fills',
              ],
            },
          ],
        },
        {
          id: 'ch_gate_ml',
          courseId: 'crs_gate_da',
          title: 'Chapter 6: Machine Learning — Supervised & Unsupervised (मशीन लर्निंग)',
          sequence: 6,
          learningObjectives: [
            'Supervised Learning: Linear Regression (OLS), Ridge (L2), Lasso (L1), and Logistic Regression',
            'Decision Trees: Information Gain, Entropy, Gini Index, Pruning, and Ensemble methods (Random Forest, XGBoost)',
            'Support Vector Machines (SVM): Maximum Margin Classifier, Dual Formulation, Soft Margin, and Kernel Functions',
            'Unsupervised Learning: k-Means Clustering, Elbow criterion, Hierarchical Agglomerative Clustering, and PCA',
            'Validation & Metrics: Bias-Variance Decomposition, k-Fold Cross-Validation, Precision, Recall, F1-Score, and ROC-AUC',
          ],
          topics: [
            {
              id: 'top_gate_reg',
              title: 'Linear & Logistic Regression with Regularization',
              difficulty: 'medium',
              summary: 'OLS minimizes sum of squared residuals: w = (XᵀX)⁻¹Xᵀy. Ridge adds λ||w||₂² preventing multicollinearity. Lasso adds λ||w||₁ producing sparse solutions (feature selection).',
              formulas: [
                'w_{OLS} = (XᵀX)⁻¹Xᵀy',
                'Loss_{Ridge} = ||y - Xw||² + λ||w||₂²',
                'Loss_{Lasso} = ||y - Xw||² + λ||w||₁',
                'Sigmoid: σ(z) = 1 / (1 + e^{-z})',
              ],
              keyPoints: [
                'L1 regularization contour has sharp diamond corners causing exact zero weights',
                'Logistic regression models log-odds: ln(p / (1-p)) = wᵀx + b',
                'Binary cross-entropy loss: L = -[y log p + (1-y) log(1-p)]',
              ],
            },
            {
              id: 'top_gate_svm',
              title: 'Support Vector Machines (SVM) & Maximum Margin',
              difficulty: 'hard',
              summary: 'SVM finds the separating hyperplane wᵀx + b = 0 maximizing the geometric margin 2/||w||. Dual formulation depends only on dot products x_i · x_j, enabling the Kernel trick K(x_i, x_j) = Φ(x_i) · Φ(x_j).',
              formulas: ['Margin = 2 / ||w||', 'min 1/2 ||w||² s.t. y_i(wᵀx_i + b) ≥ 1', 'RBF Kernel: K(x, z) = exp(-γ ||x - z||²)'],
              keyPoints: [
                'Support vectors are data points lying on the margin boundaries with non-zero Lagrange multipliers α_i > 0',
                'Mercer\'s theorem guarantees valid inner products in high-dimensional Hilbert spaces',
                'Soft margin parameter C balances margin width vs classification error penalty',
              ],
            },
          ],
        },
        {
          id: 'ch_gate_ai',
          courseId: 'crs_gate_da',
          title: 'Chapter 7: Artificial Intelligence & Neural Networks (कृत्रिम बुद्धिमत्ता)',
          sequence: 7,
          learningObjectives: [
            'State-Space Search: Uninformed (BFS, DFS, Uniform Cost) and Informed Search (Greedy Best-First, A* Search)',
            'Heuristic Properties: Admissibility h(n) ≤ h*(n), Consistency (Monotonicity), and Optimality proofs of A*',
            'Adversarial Search & Game Playing: Minimax algorithm, evaluation functions, and Alpha-Beta Pruning cutoffs',
            'Knowledge Representation: Propositional Logic, Truth Tables, CNF, Resolution Principle, and First-Order Predicate Logic',
            'Artificial Neural Networks: Single-layer Perceptron, Multi-Layer Perceptron (MLP), Activation Functions (ReLU, Softmax), and Backpropagation',
          ],
          topics: [
            {
              id: 'top_gate_astar',
              title: 'A* Search, Heuristics & Alpha-Beta Pruning',
              difficulty: 'hard',
              summary: 'A* evaluates nodes using f(n) = g(n) + h(n), where g(n) is the cost from start and h(n) is the heuristic estimate to goal. If h(n) is admissible (never overestimates), tree-search A* is guaranteed to be optimal.',
              formulas: ['f(n) = g(n) + h(n)', 'Admissibility: 0 ≤ h(n) ≤ h*(n)', 'Consistency: h(n) ≤ c(n, a, n\') + h(n\')', 'Pruning: α ≥ β cutoff'],
              keyPoints: [
                'Consistent heuristics are always admissible and guarantee that the first time a node is expanded, the path is optimal',
                'Alpha-Beta pruning yields the exact same decision as standard Minimax while cutting branching factor from b to √b in the best ordering',
              ],
            },
            {
              id: 'top_gate_mlp',
              title: 'Neural Networks & Backpropagation Algorithm',
              difficulty: 'hard',
              summary: 'Multilayer Perceptron with non-linear activations acts as a universal function approximator. Gradients are computed using the multivariate chain rule from output layer backward to input layer.',
              formulas: [
                'z^{[l]} = W^{[l]} a^{[l-1]} + b^{[l]}',
                'a^{[l]} = g(z^{[l]})',
                'ReLU(z) = max(0, z)',
                '∂L/∂W^{[l]} = δ^{[l]} (a^{[l-1]})ᵀ',
                'δ^{[l]} = ((W^{[l+1]})ᵀ δ^{[l+1]}) ⊙ g\'(z^{[l]})',
              ],
              keyPoints: [
                'ReLU prevents vanishing gradients in deep networks compared to sigmoid/tanh',
                'Softmax output layer normalizes logits into a valid probability distribution: Σ p_i = 1',
                'Weight updates: W ← W - η ∂L/∂W using Stochastic Gradient Descent or Adam',
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'crs_math_10',
      title: 'Class 10 Mathematics: Foundational & Board Mastery',
      category: 'school',
      level: 'Secondary (Class 10)',
      boardOrExam: 'CBSE & State Boards',
      description: 'Comprehensive step-by-step mathematical reasoning covering Real Numbers, Polynomials, Quadratic Equations, and Arithmetic Progressions in Hindi and English.',
      thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80',
      teacherId: 'usr_teacher_1',
      teacherName: 'Dr. Priya Raman',
      teacherTitle: 'Senior Mathematics Faculty & CBSE Mentor',
      teacherAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      chaptersCount: 5,
      enrolledStudentsCount: 1420,
      isEnrolled: true,
      videoLectures: [
        {
          id: 'lec_qe_1',
          courseId: 'crs_math_10',
          title: 'Lecture 1: Quadratic Equations Basics & Discriminant D Analysis',
          platform: 'youtube',
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          duration: '38 mins',
          description: 'Step-by-step concept derivation for standard form ax² + bx + c = 0, D = b² - 4ac, and root conditions.',
          chapterTitle: 'Chapter 4: Quadratic Equations (द्विघात समीकरण)',
          uploadedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        },
        {
          id: 'lec_qe_2',
          courseId: 'crs_math_10',
          title: 'Lecture 2: Sridharacharya Quadratic Formula Mastery & Word Problems',
          platform: 'youtube',
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          duration: '45 mins',
          description: 'Applying x = (-b ± √(b² - 4ac))/(2a) to real-life speed-distance and area problems.',
          chapterTitle: 'Chapter 4: Quadratic Equations (द्विघात समीकरण)',
          uploadedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        },
      ],
      chapters: [
        {
          id: 'ch_qe_10',
          courseId: 'crs_math_10',
          title: 'Chapter 4: Quadratic Equations (द्विघात समीकरण)',
          sequence: 1,
          learningObjectives: [
            'Understand standard form ax² + bx + c = 0',
            'Master factorization by splitting the middle term',
            'Apply Quadratic Formula: x = (-b ± √(b² - 4ac)) / (2a)',
            'Analyze Discriminant D = b² - 4ac and Nature of Roots',
          ],
          topics: [
            {
              id: 'top_qe_roots',
              title: 'Nature of Roots & Discriminant',
              difficulty: 'medium',
              summary: 'If D > 0, roots are real and distinct. If D = 0, roots are real and equal. If D < 0, roots are imaginary.',
              formulas: ['D = b² - 4ac', 'x = (-b ± √D) / 2a'],
              keyPoints: ['a ≠ 0 is mandatory', 'D determines real vs complex solutions'],
            },
            {
              id: 'top_qe_factor',
              title: 'Factorization & Middle-Term Splitting',
              difficulty: 'easy',
              summary: 'Splitting bx into two terms whose product is a * c and whose sum is b.',
              formulas: ['(px + q)(rx + s) = 0'],
              keyPoints: ['Always check sign conventions (+ and -)', 'Factor out common binomials'],
            },
          ],
        },
        {
          id: 'ch_trig_10',
          courseId: 'crs_math_10',
          title: 'Chapter 8: Introduction to Trigonometry (त्रिकोणमिति)',
          sequence: 2,
          learningObjectives: [
            'Define trigonometric ratios (sin, cos, tan, cot, sec, cosec)',
            'Evaluate values for 0°, 30°, 45°, 60°, and 90°',
            'Prove fundamental identities: sin²θ + cos²θ = 1',
          ],
          topics: [
            {
              id: 'top_trig_ident',
              title: 'Pythagorean Trigonometric Identities',
              difficulty: 'hard',
              summary: 'sin²θ + cos²θ = 1, 1 + tan²θ = sec²θ, 1 + cot²θ = cosec²θ',
              formulas: ['sin²θ + cos²θ = 1', 'sec²θ - tan²θ = 1'],
              keyPoints: ['Only valid when defined angles are real', 'Substitute sin/cos when stuck in proofs'],
            },
          ],
        },
      ],
    },
    {
      id: 'crs_jee_phys',
      title: 'JEE Main & Advanced: Mechanics & Newton\'s Laws',
      category: 'competitive',
      level: 'Competitive Engineering',
      boardOrExam: 'NTA JEE / IIT Entrance',
      description: 'Rigorous conceptual physics focusing on Free Body Diagrams, Friction, Work-Energy Theorem, and Rotational Dynamics with deterministic calculation.',
      thumbnail: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&auto=format&fit=crop&q=80',
      chaptersCount: 6,
      enrolledStudentsCount: 3890,
      isEnrolled: true,
      chapters: [
        {
          id: 'ch_nlm',
          courseId: 'crs_jee_phys',
          title: 'Newton\'s Laws of Motion & Free Body Diagrams',
          sequence: 1,
          learningObjectives: [
            'Draw accurate Free Body Diagrams (FBD) under constrained motion',
            'Solve pulley and wedge constraint relations',
            'Compute static vs kinetic friction boundaries',
          ],
          topics: [
            {
              id: 'top_nlm_fbd',
              title: 'Constrained Pulley Systems',
              difficulty: 'hard',
              summary: 'Tension conservation equation Σ T·a = 0 and virtual work principles for multiblock systems.',
              formulas: ['Σ F = ma', 'f_max = μ_s * N'],
              keyPoints: ['Identify massless and inextensible strings', 'Draw separate FBD for each individual block'],
            },
          ],
        },
      ],
    },
    {
      id: 'crs_neet_bio',
      title: 'NEET UG: Genetics, Evolution & Molecular Biology',
      category: 'competitive',
      level: 'Medical Entrance',
      boardOrExam: 'NTA NEET',
      description: 'High-yield NCERT-aligned medical entrance preparation covering Mendelian genetics, DNA replication, transcription, and genetic disorders.',
      thumbnail: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=600&auto=format&fit=crop&q=80',
      chaptersCount: 4,
      enrolledStudentsCount: 2950,
      isEnrolled: false,
      chapters: [
        {
          id: 'ch_genetics_1',
          courseId: 'crs_neet_bio',
          title: 'Principles of Inheritance and Variation',
          sequence: 1,
          learningObjectives: [
            'Understand Mendel\'s Laws: Dominance, Segregation, Independent Assortment',
            'Analyze test crosses, incomplete dominance, and codominance (ABO blood groups)',
            'Master pedigree charts and chromosomal disorders',
          ],
          topics: [
            {
              id: 'top_mendel_laws',
              title: 'Mendelian Ratios & Pedigree Analysis',
              difficulty: 'medium',
              summary: 'Monohybrid phenotypic ratio 3:1, genotypic ratio 1:2:1. Dihybrid ratio 9:3:3:1.',
              formulas: ['Dihybrid ratio: 9:3:3:1', 'Test cross ratio: 1:1'],
              keyPoints: ['Law of segregation has no exceptions in diploid organisms', 'Linkage deviates from independent assortment'],
            },
          ],
        },
      ],
    },
    {
      id: 'crs_upsc_polity',
      title: 'UPSC Civil Services: Indian Polity & Constitution',
      category: 'competitive',
      level: 'Civil Services Examination',
      boardOrExam: 'UPSC CSE Prelims & Mains',
      description: 'In-depth conceptual analysis of Fundamental Rights, Directive Principles, Parliamentary Procedures, and Landmark Supreme Court Judgments.',
      thumbnail: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
      chaptersCount: 8,
      enrolledStudentsCount: 5120,
      isEnrolled: true,
      chapters: [
        {
          id: 'ch_fund_rights',
          courseId: 'crs_upsc_polity',
          title: 'Part III: Fundamental Rights (Articles 12 to 35)',
          sequence: 1,
          learningObjectives: [
            'Distinguish Article 14 (Equality before Law & Equal Protection of the Laws)',
            'Examine Article 21 and the expansion of the Right to Life (Maneka Gandhi case)',
            'Understand Writ Jurisdiction under Article 32 vs Article 226',
          ],
          topics: [
            {
              id: 'top_writs',
              title: 'Constitutional Remedies & Writs (Article 32)',
              difficulty: 'hard',
              summary: 'Habeas Corpus, Mandamus, Prohibition, Certiorari, and Quo-Warranto.',
              keyPoints: ['Article 32 is basic structure of the Constitution (Dr. B.R. Ambedkar termed it Heart and Soul)', 'Direct access to Supreme Court'],
            },
          ],
        },
      ],
    },
    {
      id: 'crs_btech_dsa',
      title: 'B.Tech CSE: Data Structures & Algorithms (DSA)',
      category: 'engineering',
      level: 'Undergraduate Engineering',
      boardOrExam: 'AICTE / University Syllabus',
      description: 'Master asymptotic notation, balanced trees, graph traversal, dynamic programming, and memory layouts in C++ and Python.',
      thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80',
      chaptersCount: 7,
      enrolledStudentsCount: 4610,
      isEnrolled: true,
      chapters: [
        {
          id: 'ch_trees_graphs',
          courseId: 'crs_btech_dsa',
          title: 'Binary Trees & Balanced AVL Trees',
          sequence: 1,
          learningObjectives: [
            'Tree traversal algorithms (Inorder, Preorder, Postorder, BFS Level-Order)',
            'BST properties and worst-case vs average-case complexities',
            'AVL self-balancing tree rotations (LL, RR, LR, RL)',
          ],
          topics: [
            {
              id: 'top_avl_rotations',
              title: 'AVL Balance Factor & Tree Rotations',
              difficulty: 'hard',
              summary: 'Balance Factor = height(left) - height(right). Must be in {-1, 0, 1}.',
              formulas: ['BF = h_L - h_R', 'Search/Insert/Delete: O(log n) guaranteed'],
              keyPoints: ['Height guaranteed ≤ 1.44 log₂(n)', 'Single vs double rotation conditions'],
            },
          ],
        },
      ],
    },
  ],

  conversations: [
    {
      id: 'conv_sample_1',
      userId: 'usr_student_1',
      title: 'द्विघात समीकरण (Quadratic Formula) - Hindi Explanation',
      subject: 'Mathematics',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      messages: [
        {
          id: 'msg_1',
          conversationId: 'conv_sample_1',
          sender: 'user',
          content: 'सर, क्या आप द्विघात समीकरण का सूत्र और Discriminant (D) सरल हिंदी में समझा सकते हैं?',
          timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
          language: 'hi',
        },
        {
          id: 'msg_2',
          conversationId: 'conv_sample_1',
          sender: 'assistant',
          content: `नमस्ते आरव! बिल्कुल, आइए द्विघात समीकरण (Quadratic Equation) को बहुत सरल तरीके से समझते हैं:

### 1. मानक रूप (Standard Form)
द्विघात समीकरण हमेशा इस रूप में होता है:
$$ax^2 + bx + c = 0$$
यहाँ $a \\neq 0$ होना चाहिए।

---

### 2. विविक्तकर (Discriminant $D$)
समीकरण के मूल (roots/solutions) की प्रकृति जानने के लिए हम $D$ निकालते हैं:
$$D = b^2 - 4ac$$

- **यदि $D > 0$**: दो वास्तविक और भिन्न मूल (Real & Distinct roots) मिलेंगे।
- **यदि $D = 0$**: दो वास्तविक और बराबर मूल (Real & Equal roots, $-\\frac{b}{2a}$) मिलेंगे।
- **यदि $D < 0$**: कोई वास्तविक मूल नहीं होगा (Imaginary roots)।

---

### 3. श्रीधराचार्य सूत्र (Quadratic Formula)
मूल निकालने का सीधा सूत्र:
$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$

**उदाहरण:** $x^2 - 5x + 6 = 0$
- $a = 1, b = -5, c = 6$
- $D = (-5)^2 - 4(1)(6) = 25 - 24 = 1$ ($D > 0$, मूल वास्तविक हैं)
- $x = \\frac{5 \\pm \\sqrt{1}}{2} = \\frac{5 \\pm 1}{2}$
- $x = 3$ या $x = 2$।

क्या आप एक प्रश्न खुद हल करके देखना चाहेंगे?`,
          timestamp: new Date(Date.now() - 3600000 * 2 + 1000).toISOString(),
          language: 'hi',
          modelUsed: 'Qwen3-Instruct (Educational Engine Adapter)',
          mathSolution: {
            originalExpression: 'x^2 - 5x + 6 = 0',
            steps: [
              'Identify coefficients: a=1, b=-5, c=6',
              'Calculate Discriminant: D = b² - 4ac = (-5)² - 4(1)(6) = 25 - 24 = 1',
              'Check roots condition: D > 0 => Two real distinct roots',
              'Apply quadratic formula: x = (5 ± √1) / 2 = (5 ± 1) / 2',
            ],
            finalResult: 'x = 3 or x = 2',
            engine: 'SymPy Deterministic Engine',
          },
          socraticHint: 'जब भी $b^2 - 4ac$ का मान पूर्ण वर्ग (perfect square) हो, मूल परिमेय (rational) संख्याएँ होंगी।',
          groundingConfidence: 0.98,
        },
      ],
    },
  ],

  documents: [
    {
      id: 'doc_ncert_quad',
      userId: 'usr_student_1',
      filename: 'Class_10_NCERT_Math_Quadratic_Equations.pdf',
      fileSize: 1845000,
      mimeType: 'application/pdf',
      status: 'indexed',
      extractedTextLength: 14200,
      chunkCount: 8,
      uploadedAt: new Date(Date.now() - 86400000).toISOString(),
      ocrApplied: false,
      chunks: [
        {
          id: 'chk_1',
          documentId: 'doc_ncert_quad',
          chunkIndex: 0,
          section: 'Section 4.1: Introduction to Quadratic Equations',
          text: 'A quadratic equation in the variable x is an equation of the form ax² + bx + c = 0, where a, b, c are real numbers and a ≠ 0. For example, 2x² + x - 300 = 0 is a quadratic equation. Any equation of degree 2 in one variable is quadratic.',
          tokenCount: 65,
        },
        {
          id: 'chk_2',
          documentId: 'doc_ncert_quad',
          chunkIndex: 1,
          section: 'Section 4.3: Solution by Quadratic Formula',
          text: 'If b² - 4ac ≥ 0, then the roots of the quadratic equation ax² + bx + c = 0 are given by x = (-b ± √(b² - 4ac)) / (2a). This formula for finding the roots is known as the quadratic formula or Sridharacharya formula.',
          tokenCount: 62,
        },
      ],
    },
    {
      id: 'doc_jee_friction',
      userId: 'usr_student_1',
      filename: 'JEE_Physics_Mechanics_Friction_Notes.pdf',
      fileSize: 920000,
      mimeType: 'application/pdf',
      status: 'indexed',
      extractedTextLength: 8500,
      chunkCount: 5,
      uploadedAt: new Date(Date.now() - 43200000).toISOString(),
      ocrApplied: true,
      chunks: [
        {
          id: 'chk_fric_1',
          documentId: 'doc_jee_friction',
          chunkIndex: 0,
          section: 'Topic: Static vs Kinetic Friction',
          text: 'Static friction is self-adjusting in nature. Its magnitude satisfies 0 ≤ f_s ≤ μ_s * N. Once relative motion begins between surfaces, kinetic friction takes over with f_k = μ_k * N, where μ_k is generally slightly less than μ_s.',
          tokenCount: 58,
        },
      ],
    },
  ],

  quizzes: [
    {
      id: 'qz_quad_diagnostic',
      title: 'Class 10 Math: Quadratic Equations Diagnostic Quiz',
      subject: 'Mathematics',
      topic: 'Quadratic Equations & Roots',
      difficulty: 'medium',
      timeLimitMinutes: 10,
      createdAt: new Date().toISOString(),
      questions: [
        {
          id: 'q_1',
          subject: 'Mathematics',
          topic: 'Nature of Roots',
          difficulty: 'medium',
          type: 'mcq',
          questionText: 'For the equation 2x² - 4x + 3 = 0, what is the nature of its roots?',
          options: [
            'A) Real and distinct',
            'B) Real and equal',
            'C) No real roots (Imaginary)',
            'D) Rational and unequal',
          ],
          correctAnswer: 'C) No real roots (Imaginary)',
          explanation: 'Discriminant D = b² - 4ac = (-4)² - 4(2)(3) = 16 - 24 = -8. Since D < 0, there are no real roots.',
          prerequisiteConcept: 'Calculation of Discriminant (D = b² - 4ac)',
        },
        {
          id: 'q_2',
          subject: 'Mathematics',
          topic: 'Factorization',
          difficulty: 'easy',
          type: 'mcq',
          questionText: 'What are the roots of the quadratic equation x² - 7x + 12 = 0?',
          options: [
            'A) x = 3, 4',
            'B) x = -3, -4',
            'C) x = 2, 6',
            'D) x = -2, -6',
          ],
          correctAnswer: 'A) x = 3, 4',
          explanation: 'Split middle term: x² - 3x - 4x + 12 = 0 => (x - 3)(x - 4) = 0 => x = 3, 4.',
          prerequisiteConcept: 'Splitting the middle term using product-sum rule',
        },
        {
          id: 'q_3',
          subject: 'Mathematics',
          topic: 'Quadratic Standard Form',
          difficulty: 'easy',
          type: 'true_false',
          questionText: 'Is the equation (x + 1)² = 2(x - 3) a quadratic equation?',
          options: ['True', 'False'],
          correctAnswer: 'True',
          explanation: 'Expanding: x² + 2x + 1 = 2x - 6 => x² + 7 = 0. The highest power of x is 2, with non-zero coefficient a=1, so it is a quadratic equation.',
          prerequisiteConcept: 'Definition of quadratic degree 2 polynomial',
        },
        {
          id: 'q_4',
          subject: 'Mathematics',
          topic: 'Equal Roots Condition',
          difficulty: 'hard',
          type: 'mcq',
          questionText: 'Find the value of k for which the quadratic equation kx(x - 2) + 6 = 0 has two equal real roots.',
          options: ['A) k = 0', 'B) k = 6', 'C) k = 4', 'D) k = -6'],
          correctAnswer: 'B) k = 6',
          explanation: 'kx² - 2kx + 6 = 0. Here a = k, b = -2k, c = 6. For equal roots, D = 0 => (-2k)² - 4(k)(6) = 0 => 4k² - 24k = 0 => 4k(k - 6) = 0. Since k ≠ 0 for a quadratic equation, k = 6.',
          prerequisiteConcept: 'Condition D = 0 for equal roots & non-zero coefficient a ≠ 0',
        },
        {
          id: 'q_5',
          subject: 'Mathematics',
          topic: 'Discriminant Applications',
          difficulty: 'medium',
          type: 'mcq',
          questionText: 'If one root of the quadratic equation 2x² + kx - 6 = 0 is 2, what is the value of k?',
          options: ['A) k = -1', 'B) k = 1', 'C) k = 2', 'D) k = -2'],
          correctAnswer: 'A) k = -1',
          explanation: 'Substitute x = 2 into the equation: 2(2)² + k(2) - 6 = 0 => 8 + 2k - 6 = 0 => 2 + 2k = 0 => 2k = -2 => k = -1.',
          prerequisiteConcept: 'Substitution of known root into polynomial f(α) = 0',
        },
      ],
    },
    {
      id: 'qz_gate_da_mock_1',
      courseId: 'crs_gate_da',
      title: 'GATE DA: Linear Algebra, SVD & Matrix Calculus Mock Test',
      subject: 'GATE Data Science & AI',
      topic: 'Eigenvalues, SVD, Gradient & Hessian',
      difficulty: 'hard',
      timeLimitMinutes: 25,
      createdAt: new Date().toISOString(),
      questions: [
        {
          id: 'q_gda_1',
          subject: 'Linear Algebra',
          topic: 'Eigenvalues & Characteristic Equation',
          difficulty: 'hard',
          type: 'mcq',
          questionText: 'Let A be a 3×3 real matrix with eigenvalues 1, 2, and 4. What is the determinant of the matrix (A² + 2I)?',
          options: ['A) 180', 'B) 108', 'C) 72', 'D) 54'],
          correctAnswer: 'B) 108',
          explanation: 'Spectral mapping theorem: if λ is an eigenvalue of A, then λ² + 2 is an eigenvalue of A² + 2I. For λ₁=1, λ₂=2, λ₃=4, the new eigenvalues are: 1²+2 = 3, 2²+2 = 6, 4²+2 = 18. Determinant is product of eigenvalues: det = 3 × 6 × 18 = 108.',
          prerequisiteConcept: 'Spectral mapping theorem & det(M) = product of eigenvalues',
        },
        {
          id: 'q_gda_2',
          subject: 'Linear Algebra',
          topic: 'Singular Value Decomposition (SVD)',
          difficulty: 'medium',
          type: 'mcq',
          questionText: 'Let A be a 5×3 real matrix with rank 2. How many strictly positive singular values does A have in its SVD representation A = U Σ Vᵀ?',
          options: ['A) 1', 'B) 2', 'C) 3', 'D) 5'],
          correctAnswer: 'B) 2',
          explanation: 'The number of non-zero (strictly positive) singular values of any matrix A is exactly equal to the rank of A. Since rank(A) = 2, there are exactly 2 non-zero singular values (σ₁ ≥ σ₂ > 0, and σ₃ = 0).',
          prerequisiteConcept: 'Rank-Singular Value Equivalence in SVD',
        },
        {
          id: 'q_gda_3',
          subject: 'Calculus & Optimization',
          topic: 'Hessian Matrix & Stationary Points',
          difficulty: 'hard',
          type: 'mcq',
          questionText: 'For a twice-differentiable multivariable function f(x, y), the gradient at critical point (0, 0) is ∇f = [0, 0]ᵀ and the Hessian matrix is H = [[2, 1], [1, 3]]. What is the geometric nature of (0, 0)?',
          options: ['A) Strict Local Minimum', 'B) Strict Local Maximum', 'C) Saddle Point', 'D) Inconclusive Test'],
          correctAnswer: 'A) Strict Local Minimum',
          explanation: 'Leading principal minors: D₁ = 2 > 0. D₂ = det(H) = (2)(3) - (1)(1) = 5 > 0. By Sylvester criterion, both eigenvalues of H are positive (positive definite), which guarantees a strict local minimum.',
          prerequisiteConcept: 'Second Derivative Test & Positive Definite Hessian Matrix',
        },
        {
          id: 'q_gda_4',
          subject: 'Artificial Intelligence',
          topic: 'A* Search Admissibility',
          difficulty: 'medium',
          type: 'mcq',
          questionText: 'In state-space A* search with evaluation function f(n) = g(n) + h(n), which condition guarantees that tree-search A* will always return the optimal shortest path?',
          options: [
            'A) The heuristic is admissible: 0 ≤ h(n) ≤ h*(n) for all nodes n',
            'B) The heuristic is inflated: h(n) ≥ 2h*(n)',
            'C) The step cost between any two adjacent states is strictly zero',
            'D) All state-space nodes are visited in FIFO order',
          ],
          correctAnswer: 'A) The heuristic is admissible: 0 ≤ h(n) ≤ h*(n) for all nodes n',
          explanation: 'An admissible heuristic never overestimates the actual cost h*(n) to reach the closest goal node. This guarantees that A* tree search never pops a suboptimal goal off the priority queue before the optimal one.',
          prerequisiteConcept: 'A* Search Optimality & Admissible Heuristics',
        },
        {
          id: 'q_gda_5',
          subject: 'Database Systems',
          topic: 'Functional Dependencies & BCNF',
          difficulty: 'hard',
          type: 'mcq',
          questionText: 'Consider relation R(A, B, C) with functional dependencies F = {A → B, B → C, C → A}. What is the highest normal form satisfied by relation R?',
          options: ['A) Boyce-Codd Normal Form (BCNF)', 'B) Third Normal Form (3NF) only', 'C) Second Normal Form (2NF) only', 'D) First Normal Form (1NF) only'],
          correctAnswer: 'A) Boyce-Codd Normal Form (BCNF)',
          explanation: 'Closures: A⁺ = {A, B, C}, B⁺ = {A, B, C}, C⁺ = {A, B, C}. Thus A, B, and C are each individual candidate keys (superkeys) of R. Since every determinant in F is a superkey, R satisfies BCNF (and also 3NF, 2NF).',
          prerequisiteConcept: 'Candidate key computation and BCNF definition',
        },
      ],
    },
    {
      id: 'qz_gate_da_mock_2',
      courseId: 'crs_gate_da',
      title: 'GATE DA: Probability, Machine Learning & Statistics Diagnostic',
      subject: 'GATE Data Science & AI',
      topic: 'Bayes Theorem, Regularization, Confusion Matrix',
      difficulty: 'hard',
      timeLimitMinutes: 20,
      createdAt: new Date().toISOString(),
      questions: [
        {
          id: 'q_gda_ml_1',
          subject: 'Machine Learning',
          topic: 'L1 Lasso vs L2 Ridge Regularization',
          difficulty: 'medium',
          type: 'mcq',
          questionText: 'Why does L1 Regularization (Lasso, λ||w||₁) produce sparse solutions (setting exact coefficients to 0), whereas L2 Regularization (Ridge, λ||w||₂²) does not?',
          options: [
            'A) The L1 penalty contour has sharp diamond corners along the coordinate axes where the loss ellipse intersects',
            'B) The L1 penalty squares the gradient making it vanish',
            'C) The L2 penalty has non-differentiable points at the origin',
            'D) L1 penalty increases the learning rate dynamically',
          ],
          correctAnswer: 'A) The L1 penalty contour has sharp diamond corners along the coordinate axes where the loss ellipse intersects',
          explanation: 'The constraint region for L1 regularization is an octahedron/diamond with corners on the axes. The elliptical contours of the unconstrained sum of squares loss are much more likely to hit these corner points, driving coefficients exactly to zero.',
          prerequisiteConcept: 'Geometric interpretation of L1 vs L2 regularization',
        },
        {
          id: 'q_gda_ml_2',
          subject: 'Probability & Statistics',
          topic: 'Bayes Theorem Numerical',
          difficulty: 'hard',
          type: 'mcq',
          questionText: 'A medical diagnostic test has 99% sensitivity (detects disease when present) and 95% specificity (negative when healthy). In a population where 1% have the disease, what is the probability that a person who tests positive actually has the disease?',
          options: ['A) ~16.7%', 'B) ~99.0%', 'C) ~50.0%', 'D) ~85.2%'],
          correctAnswer: 'A) ~16.7%',
          explanation: 'P(D) = 0.01, P(D^c) = 0.99. P(+|D) = 0.99, P(+|D^c) = 1 - 0.95 = 0.05. By Bayes Rule: P(D|+) = [0.99 × 0.01] / [0.99 × 0.01 + 0.05 × 0.99] = 0.0099 / [0.0099 + 0.0495] = 0.0099 / 0.0594 = 1/6 ≈ 16.67%.',
          prerequisiteConcept: 'Bayes Theorem for rare events (base rate fallacy)',
        },
      ],
    },
  ],

  quizAttempts: [
    {
      id: 'att_101',
      quizId: 'qz_quad_diagnostic',
      quizTitle: 'Class 10 Math: Quadratic Equations Diagnostic Quiz',
      userId: 'usr_student_1',
      score: 4,
      totalQuestions: 5,
      accuracyPercentage: 80,
      timeSpentSeconds: 340,
      submittedAnswers: [
        { questionId: 'q_1', studentAnswer: 'C) No real roots (Imaginary)', isCorrect: true, explanation: 'D = -8 < 0' },
        { questionId: 'q_2', studentAnswer: 'A) x = 3, 4', isCorrect: true, explanation: 'Roots are 3 and 4' },
        { questionId: 'q_3', studentAnswer: 'True', isCorrect: true, explanation: 'Degree 2' },
        { questionId: 'q_4', studentAnswer: 'A) k = 0', isCorrect: false, explanation: 'k cannot be 0 because a != 0 in quadratic' },
        { questionId: 'q_5', studentAnswer: 'A) k = -1', isCorrect: true, explanation: 'k = -1' },
      ],
      topicBreakdown: [
        {
          topic: 'Equal Roots Condition',
          total: 1,
          correct: 0,
          accuracy: 0,
          learningGapDetected: true,
          remedialAction: 'Review non-zero leading coefficient rule (a ≠ 0) when solving for parameters under D = 0.',
        },
        {
          topic: 'Nature of Roots & Factorization',
          total: 4,
          correct: 4,
          accuracy: 100,
          learningGapDetected: false,
          remedialAction: 'Solid mastery! Ready for advanced word problems.',
        },
      ],
      attemptedAt: new Date(Date.now() - 7200000).toISOString(),
    },
  ],

  topicMastery: {
    usr_student_1: [
      {
        topic: 'Nature of Roots & Discriminant',
        subject: 'Mathematics',
        level: 88,
        status: 'mastered',
        attemptsCount: 3,
        lastPracticed: new Date(Date.now() - 7200000).toISOString(),
        recommendedAction: 'Mastered! Maintain retention with a quick weekly flashcard.',
      },
      {
        topic: 'Equal Roots Parameter Constraints',
        subject: 'Mathematics',
        level: 42,
        status: 'learning_gap',
        attemptsCount: 2,
        lastPracticed: new Date(Date.now() - 7200000).toISOString(),
        prerequisiteGap: 'Quadratic Definition: Leading coefficient a ≠ 0 constraint in parametric equations',
        recommendedAction: 'Practice 3 targeted questions on finding k when roots are equal without letting a=0.',
      },
      {
        topic: 'Trigonometric Identities (Pythagorean)',
        subject: 'Mathematics',
        level: 65,
        status: 'developing',
        attemptsCount: 2,
        lastPracticed: new Date(Date.now() - 86400000).toISOString(),
        recommendedAction: 'Revise LHS to RHS algebraic substitution techniques.',
      },
      {
        topic: 'Newton\'s 2nd Law & Pulley Systems',
        subject: 'Physics',
        level: 75,
        status: 'developing',
        attemptsCount: 4,
        lastPracticed: new Date(Date.now() - 120000000).toISOString(),
        recommendedAction: 'Review string constraint relation (Σ T · a = 0).',
      },
    ],
  },

  studyPlans: {
    usr_student_1: {
      id: 'stp_aarav',
      userId: 'usr_student_1',
      targetGoal: 'CBSE Class 10 Board Distinction & JEE Foundation',
      targetDate: '2026-03-15',
      dailyHoursAvailable: 2.5,
      tasks: [
        {
          id: 'tsk_1',
          title: 'Review Equal Roots Condition & Solve 5 Parametric Questions (k values)',
          subject: 'Mathematics',
          estimatedMinutes: 30,
          date: new Date().toISOString().split('T')[0],
          isCompleted: false,
          priority: 'high',
        },
        {
          id: 'tsk_2',
          title: 'Class 10 Trigonometry: Practice 4 NCERT Exercise 8.4 Identity Proofs',
          subject: 'Mathematics',
          estimatedMinutes: 45,
          date: new Date().toISOString().split('T')[0],
          isCompleted: false,
          priority: 'medium',
        },
        {
          id: 'tsk_3',
          title: 'Physics Mechanics: Draw Free Body Diagrams for 2-Block Pulley system',
          subject: 'Physics',
          estimatedMinutes: 40,
          date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          isCompleted: false,
          priority: 'medium',
        },
      ],
      flashcards: [
        {
          id: 'fc_1',
          subject: 'Mathematics',
          topic: 'Quadratic Discriminant',
          question: 'What is the condition for real and equal roots in ax² + bx + c = 0?',
          answer: 'D = b² - 4ac = 0 (and a ≠ 0). The identical root is x = -b / (2a).',
          mastered: true,
        },
        {
          id: 'fc_2',
          subject: 'Mathematics',
          topic: 'Trigonometry',
          question: 'What is the identity relating sec²θ and tan²θ?',
          answer: 'sec²θ - tan²θ = 1 (or 1 + tan²θ = sec²θ) for all θ where defined.',
          mastered: false,
        },
        {
          id: 'fc_3',
          subject: 'Physics',
          topic: 'Mechanics',
          question: 'What is the relationship between static friction coefficient (μ_s) and kinetic friction coefficient (μ_k)?',
          answer: 'Generally μ_s > μ_k because microscopic surface irregularities interlock deeper at rest.',
          mastered: true,
        },
        {
          id: 'fc_4',
          subject: 'Polity',
          topic: 'Constitution',
          question: 'Which writ literally translates to "You may have the body" and protects against unlawful detention?',
          answer: 'Habeas Corpus (बन्दी प्रत्यक्षीकरण) issued under Article 32 by SC and Article 226 by HC.',
          mastered: false,
        },
      ],
    },
  },

  researchJobs: [
    {
      id: 'job_ncert_1',
      sourceDomain: 'ncert.nic.in',
      sourceName: 'National Council of Educational Research and Training (NCERT)',
      resourceType: 'textbook',
      url: 'https://ncert.nic.in/textbook/pdf/jemh104.pdf',
      authorityScore: 99,
      license: 'Government Open Educational Portal (CC-BY-NC)',
      status: 'approved',
      retrievedAt: new Date(Date.now() - 172800000).toISOString(),
      extractedTitle: 'NCERT Class 10 Mathematics Chapter 4: Quadratic Equations Standard Syllabus',
      extractedSummary: 'Official curriculum textbook chapter including standard definitions, methods of factorization, formula derivation, and real-life word problems.',
      reviewNotes: 'Verified aligned with latest CBSE 2025-2026 rationalized curriculum.',
      reviewedBy: 'Vikram Sengupta (Admin)',
    },
    {
      id: 'job_diksha_2',
      sourceDomain: 'diksha.gov.in',
      sourceName: 'DIKSHA National Digital Infrastructure for Teachers & Students',
      resourceType: 'practice_set',
      url: 'https://diksha.gov.in/resources/play/content/do_313019',
      authorityScore: 98,
      license: 'Ministry of Education Open Digital Infrastructure',
      status: 'approved',
      retrievedAt: new Date(Date.now() - 86400000).toISOString(),
      extractedTitle: 'Interactive Practice Assessment: Linear Equations & Quadratic Formulations',
      extractedSummary: '15 competency-based multiple choice questions focusing on application in day-to-day scenarios.',
      reviewNotes: 'Compliant with Bloom\'s Taxonomy analysis level.',
      reviewedBy: 'Dr. Priya Raman (Teacher)',
    },
    {
      id: 'job_swayam_3',
      sourceDomain: 'swayam.gov.in',
      sourceName: 'SWAYAM / NPTEL National Learning Repository',
      resourceType: 'lecture_notes',
      url: 'https://swayam.gov.in/explorer?category=Engineering',
      authorityScore: 96,
      license: 'MHRD/AICTE Approved Open Educational Content',
      status: 'pending_review',
      retrievedAt: new Date(Date.now() - 18000000).toISOString(),
      extractedTitle: 'Computer Science: Algorithms & Balanced Tree Structures Course Handouts',
      extractedSummary: 'Detailed algorithmic proofs for AVL tree balancing, time complexity amortized analysis, and graph BFS/DFS paths.',
      reviewNotes: 'Awaiting syllabus alignment review with semester 3 curriculum.',
    },
  ],

  auditLogs: [
    {
      id: 'aud_1',
      action: 'COURSE_ENROLLMENT',
      userId: 'usr_student_1',
      timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
      details: 'Enrolled in Class 10 Mathematics: Foundational & Board Mastery',
    },
    {
      id: 'aud_2',
      action: 'QUIZ_SUBMITTED',
      userId: 'usr_student_1',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      details: 'Completed Quadratic Equations Diagnostic Quiz with 80% score. Learning gap flagged.',
    },
  ],

  liveClasses: [
    {
      id: 'live_cls_1',
      courseId: 'crs_math_10',
      courseTitle: 'Class 10 Mathematics: Foundational & Board Mastery',
      teacherId: 'usr_teacher_1',
      teacherName: 'Dr. Priya Raman',
      teacherAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      title: '🔴 LIVE Masterclass: Quadratic Equations & Board Exam Question Solving',
      description: 'Interactive live session solving 10 high-weightage board exam problems, discriminant tricks, and live doubt resolution.',
      scheduledTime: new Date(Date.now() + 1800000).toISOString(), // in 30 mins
      durationMinutes: 60,
      status: 'live',
      meetingRoomId: 'room_math_10_live',
      streamUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      attendeesCount: 48,
      chatMessages: [
        {
          id: 'chat_msg_1',
          senderId: 'usr_teacher_1',
          senderName: 'Dr. Priya Raman',
          senderRole: 'teacher',
          message: 'Welcome everyone! Today we will solve real board exam questions on discriminant D and splitting middle terms.',
          timestamp: new Date(Date.now() - 600000).toISOString(),
        },
        {
          id: 'chat_msg_2',
          senderId: 'usr_student_1',
          senderName: 'Aarav Sharma',
          senderRole: 'student',
          message: 'Good evening ma\'am! When D is zero, why are the roots always equal to -b/(2a)?',
          timestamp: new Date(Date.now() - 300000).toISOString(),
        },
        {
          id: 'chat_msg_3',
          senderId: 'usr_teacher_1',
          senderName: 'Dr. Priya Raman',
          senderRole: 'teacher',
          message: 'Great question Aarav! Because ±√D becomes ±0, leaving only -b/(2a). We will prove this on the board right now!',
          timestamp: new Date(Date.now() - 120000).toISOString(),
        },
      ],
      agenda: [
        'Quick 5-min recap of ax² + bx + c = 0',
        'Discriminant D = b² - 4ac cases breakdown',
        'Top 5 tricky factorization problems from NCERT',
        'Live Q&A and doubt clearing',
      ],
    },
    {
      id: 'live_cls_2',
      courseId: 'crs_jee_phys',
      courseTitle: 'JEE Main & Advanced: Mechanics & Newton\'s Laws',
      teacherId: 'usr_teacher_1',
      teacherName: 'Er. Rajesh Verma',
      teacherAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      title: 'Free Body Diagrams & Pulley Constraint Relations Live Workshop',
      description: 'High-speed problem solving workshop for JEE 2025/2026 aspirants covering complex pulley systems and friction boundary conditions.',
      scheduledTime: new Date(Date.now() + 86400000).toISOString(), // tomorrow
      durationMinutes: 90,
      status: 'scheduled',
      meetingRoomId: 'room_jee_phys_live',
      streamUrl: '',
      attendeesCount: 124,
      chatMessages: [],
      agenda: [
        'Virtual work method Σ T·a = 0 for pulleys',
        'Wedge constraints with relative acceleration',
        'Two-block friction problems with static vs kinetic transitions',
      ],
    },
    {
      id: 'live_gate_da_1',
      courseId: 'crs_gate_da',
      courseTitle: 'GATE DA: Data Science & Artificial Intelligence (Master Exam Prep)',
      teacherId: 'usr_teacher_1',
      teacherName: 'Dr. Priya Raman',
      teacherAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      title: '🔴 LIVE Masterclass: GATE DA 2026 High-Yield Numerical Problem Solving (Linear Algebra & Calculus)',
      description: 'Live interactive numerical problem solving covering Eigenvalues, SVD low-rank approximation, Hessian positive-definiteness, and doubt clearing for GATE DA aspirants.',
      scheduledTime: new Date(Date.now() + 900000).toISOString(), // in 15 mins (active)
      durationMinutes: 75,
      status: 'live',
      meetingRoomId: 'room_gate_da_live_1',
      streamUrl: 'https://www.youtube.com/embed/fNk_zzaMoSs',
      attendeesCount: 86,
      chatMessages: [
        {
          id: 'chat_gda_1',
          senderId: 'usr_teacher_1',
          senderName: 'Dr. Priya Raman',
          senderRole: 'teacher',
          message: 'Welcome everyone! Today we will solve real IISc-level GATE DA questions on Eigenvalues, SVD, and Hessian matrices.',
          timestamp: new Date(Date.now() - 480000).toISOString(),
        },
        {
          id: 'chat_gda_2',
          senderId: 'usr_student_1',
          senderName: 'Aarav Sharma',
          senderRole: 'student',
          message: 'Good evening ma\'am! In SVD A = U Σ V^T, are the columns of U the eigenvectors of AA^T or A^TA?',
          timestamp: new Date(Date.now() - 240000).toISOString(),
        },
        {
          id: 'chat_gda_3',
          senderId: 'usr_teacher_1',
          senderName: 'Dr. Priya Raman',
          senderRole: 'teacher',
          message: 'Excellent GATE question! The columns of U are the eigenvectors of AA^T (Left singular vectors), while columns of V are eigenvectors of A^TA (Right singular vectors). Let\'s write down the proof on screen now!',
          timestamp: new Date(Date.now() - 60000).toISOString(),
        },
      ],
      agenda: [
        'GATE DA Exam Blueprint & Marks Distribution (Linear Algebra: 15 marks)',
        '3x3 Matrix Eigenvalues, Trace & Determinant shortcut tricks',
        'Singular Value Decomposition (SVD) step-by-step numerical derivation',
        'Multivariable Hessian matrix test for saddle points vs local minima',
        'Live Q&A and doubt resolution for students',
      ],
    },
    {
      id: 'live_gate_da_2',
      courseId: 'crs_gate_da',
      courseTitle: 'GATE DA: Data Science & Artificial Intelligence (Master Exam Prep)',
      teacherId: 'usr_teacher_1',
      teacherName: 'Dr. Priya Raman',
      teacherAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      title: 'GATE DA Machine Learning & Probability: Solved Model Test Questions',
      description: 'Comprehensive problem walkthrough of Bayes rule, Central Limit Theorem, Decision Tree entropy calculations, and SVM dual formulation.',
      scheduledTime: new Date(Date.now() + 86400000).toISOString(), // tomorrow
      durationMinutes: 90,
      status: 'scheduled',
      meetingRoomId: 'room_gate_da_live_2',
      streamUrl: '',
      attendeesCount: 142,
      chatMessages: [],
      agenda: [
        'Conditional probability & Bayes theorem numericals',
        'Entropy and Information Gain calculation for Decision Trees',
        'L1 Lasso vs L2 Ridge optimization geometric intuition',
        'A* Search admissibility conditions and alpha-beta pruning trees',
      ],
    },
  ],

  studentNotes: [
    {
      id: 'note_gate_da_cheat_sheet',
      userId: 'usr_student_1',
      title: 'GATE DA (Data Science & AI) Complete Revision Sheet & Formula Bank',
      subject: 'GATE DA',
      tags: ['GATE DA', 'Linear Algebra', 'Probability', 'ML', 'Syllabus 2026'],
      content: `# GATE DA (Data Science & AI) - Ultimate Formula Bank & Quick Revision

## 1. Linear Algebra
- **Eigenvalues**: Ax = λx ⟹ det(A - λI) = 0
- **Trace & Determinant**:
  - Trace(A) = Σ λ_i
  - det(A) = ∏ λ_i
- **Singular Value Decomposition (SVD)**:
  - A = U Σ Vᵀ
  - σ_i = √(λ_i(Aᵀ A)) (Singular values are non-negative)
  - Rank(A) = count of non-zero σ_i
- **Eckart-Young Low Rank Approx**:
  - A_k = Σ_{i=1}^k σ_i u_i v_iᵀ minimizes Frobenius error ||A - A_k||_F

## 2. Calculus & Optimization
- **Gradient**: ∇f(x) = [∂f/∂x₁, ..., ∂f/∂x_n]ᵀ
- **Hessian Matrix**: H_{ij} = ∂²f / (∂x_i ∂x_j)
  - H Positive Definite (all λ > 0) ⟹ Strict Local Minimum
  - H Negative Definite (all λ < 0) ⟹ Strict Local Maximum
  - H Indefinite (mixed signs) ⟹ Saddle Point
- **Gradient Descent**: w_{t+1} = w_t - η ∇L(w_t)

## 3. Probability & Statistics
- **Bayes' Theorem**: P(A|B) = [P(B|A) P(A)] / P(B)
- **Variance**: Var(X) = E[X²] - (E[X])²
- **Covariance**: Cov(X, Y) = E[XY] - E[X]E[Y]
- **Central Limit Theorem**: Sample mean X̄ ~ N(μ, σ²/n) as n → ∞
- **Z-score**: Z = (X̄ - μ) / (σ / √n)

## 4. Machine Learning
- **Ridge (L2)**: min ||y - Xw||² + λ||w||₂² ⟹ w = (XᵀX + λI)⁻¹ Xᵀy
- **Lasso (L1)**: min ||y - Xw||² + λ||w||₁ (produces sparse features)
- **SVM Margin**: Margin = 2 / ||w||, subject to y_i(wᵀx_i + b) ≥ 1
- **Confusion Matrix**:
  - Precision = TP / (TP + FP)
  - Recall (Sensitivity) = TP / (TP + FN)
  - F1 = (2 × Precision × Recall) / (Precision + Recall)

## 5. Artificial Intelligence (AI)
- **A* Search**: f(n) = g(n) + h(n)
  - Admissibility: h(n) ≤ h*(n) guarantees optimal solution.
  - Consistency: h(n) ≤ c(n, a, n') + h(n') guarantees optimal path without reopening closed nodes.
- **Alpha-Beta Pruning**: Prune branch when α ≥ β.`,
      keyConcepts: [
        'Linear Algebra: SVD & Eigenvalues',
        'Calculus: Hessian & Gradient Descent',
        'Probability: Bayes Theorem & CLT',
        'ML: L1/L2 Regularization & SVM',
        'AI: A* Admissibility & Alpha-Beta Cutoffs',
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'note_1',
      userId: 'usr_student_1',
      title: 'द्विघात समीकरण महत्वपूर्ण सूत्र (Quadratic Formula Quick Revision)',
      subject: 'Mathematics',
      tags: ['Formula', 'Class 10', 'Board Revision'],
      content: `# द्विघात समीकरण (Quadratic Equations) - मुख्य सूत्र

1. **मानक रूप (Standard Form)**:
   ax² + bx + c = 0 (जहाँ a ≠ 0)

2. **विविक्तकर (Discriminant)**:
   D = b² - 4ac
   - D > 0: 2 वास्तविक और अलग मूल (Real & Distinct)
   - D = 0: 2 वास्तविक और बराबर मूल (Real & Equal: -b/2a)
   - D < 0: कोई वास्तविक मूल नहीं (No Real Roots)

3. **श्रीधराचार्य सूत्र (Quadratic Formula)**:
   x = (-b ± √(b² - 4ac)) / (2a)

4. **मूलों का योग और गुणनफल**:
   - योग (Sum of roots) α + β = -b / a
   - गुणनफल (Product of roots) α · β = c / a

*नोट: मध्य पद को तोड़ते समय (+ और -) चिन्हों का विशेष ध्यान रखें।*`,
      keyConcepts: ['Standard Form', 'Discriminant D', 'Quadratic Formula', 'Sum and Product of Roots'],
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: 'note_2',
      userId: 'usr_student_1',
      title: 'न्यूटन के गति नियम और घर्षण (Newton\'s Laws & Friction Concept Map)',
      subject: 'Physics',
      tags: ['Mechanics', 'JEE Foundation', 'FBD'],
      content: `# Newton's Laws & Friction Concepts

1. **Second Law**:
   F_net = m · a
   Always draw separate Free Body Diagrams (FBD) for each body!

2. **Friction Types**:
   - Static Friction: f_s ≤ μ_s · N (Self-adjusting until limit)
   - Kinetic Friction: f_k = μ_k · N (Acts opposite to relative sliding)

3. **Pulley Shortcut**:
   a = (Unbalanced pulling force) / (Total mass of system)
   Tension formula: T = 2·m1·m2·g / (m1 + m2)`,
      keyConcepts: ['F = ma', 'FBD', 'Static Friction', 'Kinetic Friction', 'Pulley Formula'],
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ],
};
