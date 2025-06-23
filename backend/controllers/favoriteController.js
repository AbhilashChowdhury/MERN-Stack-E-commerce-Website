import Favorite from '../models/favoriteModel.js';

export const getFavorites = async (req, res) => {
  try {
    const userId = req.params.userId;
    const favorites = await Favorite.find({ user: userId }).populate('product');
    // Extract product objects from favorites
    const products = favorites.map(fav => fav.product);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get favorites', error });
  }
};

export const addFavorite = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { productId } = req.body;

    const existing = await Favorite.findOne({ user: userId, product: productId });
    if (existing) return res.status(400).json({ message: 'Product already in favorites' });

    const favorite = new Favorite({ user: userId, product: productId });
    await favorite.save();

    res.status(201).json(favorite);
  } catch (error) {
    res.status(500).json({ message: 'Failed to add favorite', error });
  }
};

export const removeFavorite = async (req, res) => {
  try {
    const userId = req.params.userId;
    const productId = req.params.productId;

    const deleted = await Favorite.findOneAndDelete({ user: userId, product: productId });
    if (!deleted) return res.status(404).json({ message: 'Favorite not found' });

    res.json({ message: 'Favorite removed' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to remove favorite', error });
  }
};
