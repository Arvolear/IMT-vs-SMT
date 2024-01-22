# IMT vs SMT

This is an opensource project to compare the gas usage of Incremental Merkle Tree (IMT) and Sparse Merkle Tree inside Circom zero knowledge circuits.

## What

You will find the reference implementation of both trees in Solidity language inside `contracts` folder. The corresponding Circom circuits reside inside `circuits` folder.

The circuits verify inclusion ZKP that the element belongs to the tree. Both IMT and SMT are built on-chain with full IMT reconstructed in the tests.

You may find more information about the IMT [here](https://www.linkedin.com/posts/artemchystiakov_ethereum-datastructure-activity-7065039156019703808-VjhO/) and SMT [here](https://docs.iden3.io/publications/pdfs/Merkle-Tree.pdf).

## Results

The gas usage of trees of size of 10 (1024 leaves) and 20 (1048576 leaves) has been recorded. Full results can be seen [here](https://docs.google.com/spreadsheets/d/1zZkwjjOjn1fRJGJ40Jw1GeVGpBqGMGih-jd-uBcP3Lo/edit?usp=sharing).

![Add Element Function](https://github.com/Arvolear/IMT-vs-SMT/assets/47551140/874972d8-ba11-4dfe-93da-061cab36c035)

![Verify ZKP Function](https://github.com/Arvolear/IMT-vs-SMT/assets/47551140/750b5b45-9931-4030-8301-2aa8ec0ba121)

We can see that IMT is less expensive to maintain than SMT (9 times less expensive), but more expensive to prove (6 times more expensive). So choose your data structure wisely.

## License

The work is published under GPL-3.0 license.
