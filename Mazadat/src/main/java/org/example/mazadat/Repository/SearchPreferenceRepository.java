package org.example.mazadat.Repository;

import java.util.List;
import java.util.Optional;

import org.example.mazadat.Model.SearchPreference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SearchPreferenceRepository extends JpaRepository<SearchPreference, Integer> {

    List<SearchPreference> findByBuyerId(Integer buyerId);

    Optional<SearchPreference> findByIdAndBuyerId(Integer id, Integer buyerId);
}
