import React, { useEffect, useState } from 'react'
import '../../scss/billMaker.scss'
import { SaleItemCategory } from '../../types/saleItemCategory'
import { useGetList, useGet } from '../../hooks/useAPI'
import { ProductModifier } from '../../types/productModifier'
import BillMakerItems from '../../components/billMaker/BillMakerItems'
import useBill from '../../hooks/useBill'
import BillResume from '../../components/BillResume'
import CustomInputSelect from '../../components/generics/CustomInputSelect'

interface Props {
  tableNumber: number
}

interface SearchProduct {
  id: number
  categoryId: number
  saleItemId: number
  name: string
}

const initialSearchProduct: SearchProduct = {
  id: 0,
  categoryId: 0,
  saleItemId: 0,
  name: ''
}

const BillMaker = ({ tableNumber }: Props) => {
  const [saleItemId, setSaleItemId] = useState<number>(0)
  const [saleItemCategories, setSaleItemCategories] = useState<SaleItemCategory[]>([])
  const [saleItemCategory, setSaleItemCategory] = useState<SaleItemCategory>()
  const { bill, addBillItem, printBill, removeLinkedProduct } = useBill()
  const [searchProducts, setSearchProducts] = useState<SearchProduct[]>([])


  const handleChange = (event: any) => {
    const { value } = event.target
    const tmpSearchProduct = searchProducts.find(searchProduct => searchProduct.saleItemId === value)
    if (tmpSearchProduct) {
      const tmpSaleItemCategory = saleItemCategories.find(saleItemCategory => saleItemCategory.id === tmpSearchProduct.categoryId)
      if (tmpSaleItemCategory) {
        setSaleItemCategory(tmpSaleItemCategory)
        const tmpSaleItem = tmpSaleItemCategory.saleItems.find(saleItem => saleItem.id === tmpSearchProduct.saleItemId)
        if (tmpSaleItem) {
          setSaleItemId(tmpSaleItem.id)
        }
      }
    }
  }

  const setCategory = (saleItemCategory: SaleItemCategory) => {
    setSaleItemCategory(saleItemCategory)
    setSaleItemId(0)
  }

  const initializeSearchProducts = (saleItemCategories: SaleItemCategory[]) => {
    const tmpSearchProducts: SearchProduct[] = []
    for (const saleItemCategory of saleItemCategories) {
      for (const saleItem of saleItemCategory.saleItems) {
        const tmpSearchProduct: SearchProduct = {
          id: 0,
          categoryId: saleItemCategory.id,
          saleItemId: saleItem.id,
          name: saleItem.name
        }
        tmpSearchProducts.push(tmpSearchProduct)
      }
    }
    setSearchProducts(tmpSearchProducts)
  }



  useEffect(() => {
    const getSaleItemCategories = async () => {
      const response = await useGetList<SaleItemCategory[]>('saleItemCategories', false)
      if (!response.error) {
        const tmpSaleItemCategories = response.data
        initializeSearchProducts(saleItemCategories)
        for (const saleItemCategory of tmpSaleItemCategories) {
          for (const saleItem of saleItemCategory.saleItems) {
            for (const saleItemProduct of saleItem.saleItemProducts) {
              const productModifiersResponse = await useGet<ProductModifier[]>(`productModifiers/byProductId/${saleItemProduct.productId}`, false)
              if (!productModifiersResponse.error) {
                const productModifiers = productModifiersResponse.data
                saleItemProduct.product.productModifiers = productModifiers
              }
            }
          }
        }
        setSaleItemCategories(tmpSaleItemCategories)
      }
    }
    getSaleItemCategories()
  }, [saleItemCategory])


  return (
    <div className='col-12 d-flex flex-wrap'>
      <button className="btn btn-warning position-absolute" style={{ top: '0', right: '30vw', zIndex: '1000' }} onClick={() => printBill()}>Imprimer</button>
      <div className="col-8 bill-maker" >
        <div className="col-12 d-flex flex-wrap justify-content-end p-2">
          <div className="col-6">
            <CustomInputSelect showLabel={false} value={saleItemId}
              customInputSelect={
                {
                  label: 'Productos', name: 'id',
                  handleChange: handleChange, pattern: '', validationMessage: ''
                }}
              data={searchProducts.map(searchProduct => { return { value: searchProduct.saleItemId, label: searchProduct.name } })}
              defaultLegend={'Productos'}
            />
          </div>
        </div>
        <div className="col-8 d-flex flex-wrap justify-content-around position-absolute bg-dark p-2 shadow"
          style={{ borderBottom: '1px solid rgba(255,193,7,0.8)', top: '0' }}>
          {
            saleItemCategories.map((tmpSaleItemCategory, index) => {
              return (
                <div key={index} onClick={() => setCategory(tmpSaleItemCategory)} className="px-3 py-1 rounded pointer item-category" >
                  <h6 className='m-0'>{tmpSaleItemCategory.name}</h6>
                </div>
              )
            })
          }
        </div>
        {
          saleItemCategory &&
          <BillMakerItems saleItemId={saleItemId} addBillItem={addBillItem} saleItemCategory={saleItemCategory} />
        }
      </div>
      <div className="col-4 shadow bill-resume position-relative" style={{ height: '100vh', zIndex: '100' }}>
        <BillResume removeLinkedProduct={removeLinkedProduct} bill={bill} />
      </div>
    </div>
  )
}

export default BillMaker