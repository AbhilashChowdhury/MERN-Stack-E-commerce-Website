import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectFavoriteProduct, fetchFavorites } from "../../redux/features/favorites/favoriteSlice";
import Product from "./Product";

const Favorites = () => {
  const dispatch = useDispatch();
  const favorites = useSelector(selectFavoriteProduct);
  const userId = useSelector((state) => state.auth.userInfo?._id);

  useEffect(() => {
    if (userId) {
      dispatch(fetchFavorites(userId));
    }
  }, [dispatch, userId]);

  return (
    <div className="ml-[10rem]">
      <h1 className="text-lg font-bold ml-[3rem] mt-[3rem]">FAVORITE PRODUCTS</h1>

      <div className="flex flex-wrap gap-4 mt-4">
        {favorites && favorites.length > 0 ? (
          favorites.map((product) => (
            <Product key={product._id} product={product} />
          ))
        ) : (
          <p className="ml-[3rem] mt-[2rem]">No favorite products found.</p>
        )}
      </div>
    </div>
  );
};

export default Favorites;
